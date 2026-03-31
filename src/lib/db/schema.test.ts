import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
	account,
	billingEvents,
	certificates,
	emailEvents,
	progressMergeEvents,
	session,
	subscriptions,
	user,
	userEntitlements,
	userProgress,
	verification,
} from "./schema";

describe("db schema", () => {
	it("exports the expected Phase 1 foundation tables", () => {
		expect(getTableName(userProgress)).toBe("user_progress");
		expect(getTableName(userEntitlements)).toBe("user_entitlements");
		expect(getTableName(subscriptions)).toBe("subscriptions");
		expect(getTableName(billingEvents)).toBe("billing_events");
		expect(getTableName(certificates)).toBe("certificates");
		expect(getTableName(emailEvents)).toBe("email_events");
		expect(getTableName(progressMergeEvents)).toBe("progress_merge_events");
		expect(getTableName(user)).toBe("user");
		expect(getTableName(session)).toBe("session");
		expect(getTableName(account)).toBe("account");
		expect(getTableName(verification)).toBe("verification");
	});
});
