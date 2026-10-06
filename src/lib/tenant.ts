export type TenantContext = {
  organizationId: string;
  userId: string;
};

export function assertTenantContext(ctx: Partial<TenantContext>): asserts ctx is TenantContext {
  if (!ctx.organizationId || !ctx.userId) {
    throw new Error("Missing tenant context.");
  }
}
