import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ user: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.client }));
import { POST } from "./route";
const single=vi.fn();
const query={insert:vi.fn().mockReturnThis(),select:vi.fn().mockReturnThis(),single};
const from=vi.fn(()=>query);
const request=(overrides: Record<string, unknown> = {})=>new NextRequest("http://localhost/api/results",{method:"POST",body:JSON.stringify({
 organizationId:"00000000-0000-4000-8000-000000000001",findingId:"00000000-0000-4000-8000-000000000002",title:"Synthetic result",baselineValue:1000,resultValue:800,...overrides
})});
beforeEach(()=>{vi.clearAllMocks();mocks.user.mockResolvedValue({id:"test-user"});mocks.client.mockResolvedValue({from});});
it("relies on the atomic database operation, without a second status write",async()=>{
 single.mockResolvedValue({data:{id:"result"},error:null});
 const response=await POST(request());
 expect(response.status).toBe(201);
 expect(from).toHaveBeenCalledExactlyOnceWith("results");
 expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({baseline_value:1000,result_value:800,attributed_value:null}));
});
it.each([["23514",409],["42501",403],["XX000",500]])("reports DB error %s without partial follow-up",async(code,status)=>{
 single.mockResolvedValue({data:null,error:{code,message:"synthetic test error"}});
 expect((await POST(request())).status).toBe(status);
 expect(from).toHaveBeenCalledTimes(1);
});

it.each([{baselineValue:undefined},{resultValue:undefined},{baselineValue:-1},{organizationId:"invalid"}])("rejects invalid input without database writes",async(overrides)=>{
 expect((await POST(request(overrides))).status).toBe(400);
 expect(from).not.toHaveBeenCalled();
});
it("ignores caller supplied attribution",async()=>{
 single.mockResolvedValue({data:{id:"result"},error:null});
 expect((await POST(request({attributedValue:999}))).status).toBe(201);
 expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({attributed_value:null}));
});
