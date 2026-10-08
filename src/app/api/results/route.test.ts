import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ user: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.client }));
import { POST } from "./route";
const single=vi.fn();
const query={insert:vi.fn().mockReturnThis(),select:vi.fn().mockReturnThis(),single};
const from=vi.fn(()=>query);
const request=()=>new NextRequest("http://localhost/api/results",{method:"POST",body:JSON.stringify({
 organizationId:"00000000-0000-4000-8000-000000000001",findingId:"00000000-0000-4000-8000-000000000002",title:"Synthetic result"
})});
beforeEach(()=>{vi.clearAllMocks();mocks.user.mockResolvedValue({id:"test-user"});mocks.client.mockResolvedValue({from});});
it("relies on the atomic database operation, without a second status write",async()=>{
 single.mockResolvedValue({data:{id:"result"},error:null});
 const response=await POST(request());
 expect(response.status).toBe(201);
 expect(from).toHaveBeenCalledExactlyOnceWith("results");
});
it.each([["23514",409],["42501",403],["XX000",500]])("reports DB error %s without partial follow-up",async(code,status)=>{
 single.mockResolvedValue({data:null,error:{code,message:"synthetic test error"}});
 expect((await POST(request())).status).toBe(status);
 expect(from).toHaveBeenCalledTimes(1);
});
