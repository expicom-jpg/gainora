"""Gainora planning cash model; standard library only, never a payout engine."""
import argparse
import copy
import json
from decimal import Decimal, InvalidOperation

D = Decimal
INFLOWS = ('subscription_collections', 'committed_funding_received', 'other_cash_received')
OUTFLOWS = ('commissions_paid', 'fixed_gross_payroll', 'employer_costs',
            'founder_pay_and_costs', 'platform_and_processing', 'fixed_operations',
            'marketing', 'onboarding_and_support', 'product_security_compliance',
            'tax_vat_payments', 'refunds_and_chargebacks', 'capex_debt_and_other')
METRICS = ('minimum_channel_contribution_pct', 'maximum_channel_cac_payback_months',
           'minimum_90_day_paid_retention_pct', 'mature_paid_cohorts')
EVIDENCE = ('costs_and_receipts_verified', 'downside_assumptions_evidenced',
            'intramonth_cash_checked', 'product_security_ready', 'contracts_reviewed',
            'policy_thresholds_approved', 'founder_hiring_approval')


def number(value):
    if value is None or isinstance(value, bool):
        raise ValueError('missing or invalid number')
    try:
        result = D(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError('invalid number') from None
    if not result.is_finite() or result < 0:
        raise ValueError('number must be finite and nonnegative')
    return result


def money(value):
    return str(value.quantize(D('.01')))


def template():
    return {
        'status': 'UNFILLED', 'opening_unrestricted_cash': None,
        'commitment_start_month': None, 'evidence': {k: None for k in EVIDENCE},
        'metrics': {k: None for k in METRICS},
        'scenarios': {name: [dict(month=i, reserve_required=None,
                                  **{k: None for k in INFLOWS + OUTFLOWS})
                              for i in range(1, 19)]
                      for name in ('base', 'downside', 'severe')},
    }


def evaluate(data):
    if not isinstance(data, dict):
        return {'overall': 'NOT_READY', 'input_errors': ['input must be an object'], 'scenarios': {}}
    errors = []
    def read(value, path):
        try:
            return number(value)
        except ValueError as exc:
            errors.append(f'{path}: {exc}')
            return D(0)  # Internal only: no results published when any input is invalid.
    opening = read(data.get('opening_unrestricted_cash'), 'opening_unrestricted_cash')
    start = data.get('commitment_start_month')
    if type(start) is not int or not 1 <= start <= 13:
        errors.append('commitment_start_month: integer 1..13 required for six-month horizon')
    scenarios = data.get('scenarios')
    if not isinstance(scenarios, dict):
        scenarios = {}
    prepared = {}
    for name in ('base', 'downside', 'severe'):
        rows = scenarios.get(name)
        if not isinstance(rows, list) or len(rows) != 18:
            errors.append(f'{name}: exactly 18 monthly rows required')
            continue
        prepared[name] = []
        for i, row in enumerate(rows, 1):
            if not isinstance(row, dict):
                errors.append(f'{name}.{i}: object required')
                continue
            if type(row.get('month')) is not int or row['month'] != i:
                errors.append(f'{name}.{i}: months must be consecutive 1..18')
            prepared[name].append({k: read(row.get(k), f'{name}.{i}.{k}')
                                   for k in INFLOWS + OUTFLOWS + ('reserve_required',)})
    if errors:
        return {'overall': 'NOT_READY', 'input_errors': errors, 'scenarios': {}}
    outputs = {}
    for name, rows in prepared.items():
        cash, cumulative, required = opening, D(0), rows[0]['reserve_required']
        ledger = []
        first_breach = None
        for i, row in enumerate(rows, 1):
            inflow = sum(row[k] for k in INFLOWS)
            outflow = sum(row[k] for k in OUTFLOWS)
            net = inflow - outflow
            # Opening AND closing balance must preserve this month's reserve.
            required = max(required, row['reserve_required'] - cumulative)
            breach = cash < row['reserve_required'] or cash + net < row['reserve_required']
            if breach and first_breach is None:
                first_breach = i
            cumulative += net
            required = max(required, row['reserve_required'] - cumulative)
            ledger.append(dict(month=i, opening=money(cash), receipts=money(inflow),
                               payments=money(outflow), net=money(net),
                               closing=money(cash + net), reserve=money(row['reserve_required']),
                               reserve_breach=breach))
            cash += net
        # Also check the lead-up to hiring: cash cannot fail before the gate window.
        gate_rows = ledger[:start + 5]
        gate = 'FAIL' if any(r['reserve_breach'] for r in gate_rows) else 'PASS'
        outputs[name] = dict(months=ledger, first_reserve_breach=first_breach,
                             required_opening_cash_18_months=money(max(D(0), required)),
                             six_month_cash_gate=gate)
    evidence = data.get('evidence') or {}
    if not isinstance(evidence, dict):
        evidence = {}
    missing = [k for k in EVIDENCE if evidence.get(k) is not True]
    metrics = data.get('metrics') or {}
    if not isinstance(metrics, dict):
        metrics = {}
    checks = {}
    for key, threshold, direction in (
        (METRICS[0], D(70), 'min'), (METRICS[1], D(12), 'max'),
        (METRICS[2], D(90), 'min'), (METRICS[3], D(3), 'min')):
        try:
            value = number(metrics.get(key))
            if ('pct' in key and value > 100) or (key == METRICS[3] and value != int(value)):
                raise ValueError('invalid metric')
            passed = value >= threshold if direction == 'min' else value <= threshold
            checks[key] = 'PASS' if passed else 'FAIL'
        except ValueError:
            checks[key] = 'NOT_READY'
    failures = outputs['downside']['six_month_cash_gate'] == 'FAIL' or 'FAIL' in checks.values()
    overall = 'FAIL' if failures else 'NOT_READY' if missing or 'NOT_READY' in checks.values() else 'REVIEW_REQUIRED'
    if data.get('status') == 'ILLUSTRATIVE':
        overall = 'ILLUSTRATIVE_ONLY'
    return dict(overall=overall, unconfirmed_evidence=missing, proposed_policy_checks=checks,
                scenarios=outputs, note='No output authorizes hiring, contracts or payouts.')


def portfolio_commission(customers, price=D(2495)):
    """Illustration only: equal prices, settled monthly subscriptions, one portfolio."""
    result = D(0)
    for width, rate in ((20, '.08'), (20, '.10'), (20, '.12'), (40, '.14'), (customers, '.16')):
        take = min(customers, width)
        result += take * price * D(rate)
        customers -= take
    return result


def demo():
    data = template()
    data.update(status='ILLUSTRATIVE', opening_unrestricted_cash=0, commitment_start_month=1)
    for name, counts in (
        ('base', [10, 20, 35, 50, 70, 100] + [100] * 12),
        ('downside', [5, 10, 15, 20, 25, 30] + [30] * 12),
        ('severe', [0] * 18)):
        for row, n in zip(data['scenarios'][name], counts):
            row.update({k: 0 for k in INFLOWS + OUTFLOWS})
            revenue = D(n) * 2495
            own = portfolio_commission(n * 2 // 5)
            row.update(subscription_collections=money(revenue),
                       commissions_paid=money(own * 2 + revenue * D('.4') * D('.02') + revenue * D('.2') * D('.2')),
                       fixed_gross_payroll=62500, employer_costs=9375,
                       platform_and_processing=money(revenue * D('.1')),
                       fixed_operations=20000, reserve_required=183750)
    return data


def self_test():
    assert evaluate(template())['overall'] == 'NOT_READY'
    result = evaluate(demo())
    assert result['overall'] == 'ILLUSTRATIVE_ONLY'
    assert result['scenarios']['base']['months'][5]['net'] == '102735.00'
    assert result['scenarios']['base']['months'][2]['closing'] == '-147831.10'
    assert result['scenarios']['downside']['months'][5]['closing'] == '-344813.70'
    for boundary, rate in ((20, '.10'), (40, '.12'), (60, '.14'), (100, '.16')):
        assert portfolio_commission(boundary + 1) - portfolio_commission(boundary) == D(2495) * D(rate)
    data = demo()
    data.update(status='PLANNING', opening_unrestricted_cash=10000000)
    assert evaluate(data)['overall'] == 'NOT_READY'  # Money alone is insufficient.
    data['evidence'] = {k: True for k in EVIDENCE}
    data['metrics'] = dict(zip(METRICS, (70, 12, 90, 3)))
    assert evaluate(data)['overall'] == 'REVIEW_REQUIRED'
    data['metrics'][METRICS[0]] = 69
    assert evaluate(data)['overall'] == 'FAIL'
    for bad in (None, -1, True, 'NaN', 'Infinity'):
        invalid = copy.deepcopy(data)
        invalid['scenarios']['base'][0]['marketing'] = bad
        assert evaluate(invalid)['overall'] == 'NOT_READY'
    invalid = copy.deepcopy(data)
    invalid['commitment_start_month'] = 14
    assert evaluate(invalid)['overall'] == 'NOT_READY'
    print('PASS: cash reconciliation, progressive boundaries, missing/invalid inputs, horizon and evidence gates')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--input', help='JSON monthly cash inputs')
    group.add_argument('--template', action='store_true')
    group.add_argument('--demo', action='store_true')
    group.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        if args.input:
            with open(args.input, encoding='utf-8') as source:
                payload = json.load(source)
            output = evaluate(payload)
        else:
            output = template() if args.template else evaluate(demo())
        print(json.dumps(output, indent=2, ensure_ascii=False))
