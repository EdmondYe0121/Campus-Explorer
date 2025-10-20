import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import { clearDisk, getContentFromArchives, loadTestQuery } from "../TestUtil";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

use(chaiAsPromised);

export interface ITestQuery {
	title?: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let noZip: string;
	let empties: string;
	let noJson: string;
	let noResultKey: string;
	let noValidSection: string;
	let noCourseRoot: string;
	let smallData: string;
	let mixData: string;
	let roomSection: string;

	before(async function () {
		// This block runs once and loads the datasets.
		sections = await getContentFromArchives("pair.zip");
		noZip = await getContentFromArchives("test.txt");
		empties = await getContentFromArchives("empties.zip");
		noJson = await getContentFromArchives("noJson.zip");
		noResultKey = await getContentFromArchives("noResultKey.zip");
		noValidSection = await getContentFromArchives("noValidSection.zip");
		noCourseRoot = await getContentFromArchives("noCourseRoot.zip");
		smallData = await getContentFromArchives("smallData.zip");
		mixData = await getContentFromArchives("mixTest.zip");
		roomSection = await getContentFromArchives("campus.zip");
		// Just in case there is anything hanging around from a previous run of the test suite
		//await clearDisk();
	});

	describe("AddDataset", function () {
		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		it("should reject with an empty dataset id", async function () {
			// Read the "Free Mutant Walkthrough" in the spec for tips on how to get started!
			try {
				await facade.addDataset("", sections, InsightDatasetKind.Sections);

				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an whitespace dataset id", async function () {
			// Read the "Free Mutant Walkthrough" in the spec for tips on how to get started!
			try {
				await facade.addDataset(" ", sections, InsightDatasetKind.Sections);

				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should reject with an underscore dataset id", async function () {
			// Read the "Free Mutant Walkthrough" in the spec for tips on how to get started!
			try {
				await facade.addDataset("my_Course", sections, InsightDatasetKind.Sections);

				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully use no zip content", async function () {
			try {
				await facade.addDataset("ubc", noZip, InsightDatasetKind.Sections);
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully use empty content", async function () {
			try {
				await facade.addDataset("ubc", empties, InsightDatasetKind.Sections);
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully use non Json file", async function () {
			try {
				await facade.addDataset("ubc", noJson, InsightDatasetKind.Sections);
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully use no result key file", async function () {
			try {
				await facade.addDataset("ubc", noResultKey, InsightDatasetKind.Sections);
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully use no valid section file", async function () {
			try {
				await facade.addDataset("ubc", noValidSection, InsightDatasetKind.Sections);
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully use no course root file", async function () {
			try {
				await facade.addDataset("ubc", noCourseRoot, InsightDatasetKind.Sections);
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should successfully add a dataset (first)", async function () {
			const result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);

			expect(result).to.have.members(["ubc"]);
		});

		it("should successfully add a dataset (next)", async function () {
			const result = await facade.addDataset("ubc", smallData, InsightDatasetKind.Sections);

			expect(result).to.have.members(["ubc"]);
		});

		it("should successfully add a dataset (mix)", async function () {
			const result = await facade.addDataset("ubc", mixData, InsightDatasetKind.Sections);

			expect(result).to.have.members(["ubc"]);
		});

		it("should not successfully add a dataset (second)", async function () {
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			try {
				await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("it should successfully add a room", async function () {
			const result = await facade.addDataset("ubcRoom", roomSection, InsightDatasetKind.Rooms);
			expect(result).to.have.members(["ubcRoom"]);
		});

		it("it should successfully add room and sections", async function () {
			await facade.addDataset("ubcRoom", roomSection, InsightDatasetKind.Rooms);
			const result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			expect(result).to.have.members(["ubcRoom", "ubc"]);
		});
	});

	describe("RemoveDataset", function () {
		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		it("should successfully remove a valid dataset", async function () {
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			await facade.addDataset("myCourse", smallData, InsightDatasetKind.Sections);
			const result = await facade.removeDataset("myCourse");
			expect(result).to.deep.equal("myCourse");
		});

		it("should successfully remain dataset that is not remove", async function () {
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			await facade.addDataset("myCourse", smallData, InsightDatasetKind.Sections);
			await facade.removeDataset("myCourse");
			const result = await facade.listDatasets();
			expect(result).to.deep.equal([{ id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612 }]);
		});

		it("should not successfully remove a non-exist id", async function () {
			try {
				await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
				await facade.addDataset("myCourse", smallData, InsightDatasetKind.Sections);
				await facade.removeDataset("yourCourse");
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(NotFoundError);
			}
		});

		it("should not successfully remove a empty id", async function () {
			try {
				await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
				await facade.addDataset("myCourse", smallData, InsightDatasetKind.Sections);
				await facade.removeDataset("");
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully remove an underscore id", async function () {
			try {
				await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
				await facade.addDataset("myCourse", smallData, InsightDatasetKind.Sections);
				await facade.removeDataset("my_Course");
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});

		it("should not successfully remove an whitespace id", async function () {
			try {
				await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
				await facade.addDataset("myCourse", smallData, InsightDatasetKind.Sections);
				await facade.removeDataset(" ");
				expect.fail("Should have thrown!");
			} catch (err) {
				expect(err).to.be.instanceOf(InsightError);
			}
		});
	});

	describe("ListDataset", function () {
		beforeEach(async function () {
			await clearDisk();
			facade = new InsightFacade();
		});

		it("should successfully list single dataset", async function () {
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			expect(result).to.deep.equal([{ id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612 }]);
		});

		it("should successfully list double dataset", async function () {
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			await facade.addDataset("myCourse", sections, InsightDatasetKind.Sections);
			const result = await facade.listDatasets();
			expect(result).to.deep.equal([
				{ id: "ubc", kind: InsightDatasetKind.Sections, numRows: 64612 },
				{ id: "myCourse", kind: InsightDatasetKind.Sections, numRows: 64612 },
			]);
		});
	});

	describe("PerformQuery", function () {
		/**
		 * Loads the TestQuery specified in the test name and asserts the behaviour of performQuery.
		 *
		 * Note: the 'this' parameter is automatically set by Mocha and contains information about the test.
		 */
		async function checkQuery(this: Mocha.Context): Promise<void> {
			if (!this.test) {
				throw new Error(
					"Invalid call to checkQuery." +
						"Usage: 'checkQuery' must be passed as the second parameter of Mocha's it(..) function." +
						"Do not invoke the function directly."
				);
			}
			// Destructuring assignment to reduce property accesses
			const { input, expected, errorExpected } = await loadTestQuery(this.test.title);
			let result: InsightResult[] = []; // dummy value before being reassigned
			try {
				result = await facade.performQuery(input);
			} catch (err) {
				if (!errorExpected) {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}
				// since there are two kinds of error, and we can set them in test and use as condition to meet each error
				// to determine what to put here :)
				if (expected === "InsightError") {
					expect(err).to.be.instanceOf(InsightError);
				} else if (expected === "ResultTooLargeError") {
					expect(err).to.be.instanceOf(ResultTooLargeError);
				} else {
					expect.fail(`performQuery threw unexpected error: ${err}`);
				}
				return;
			}
			if (errorExpected) {
				expect.fail(`performQuery resolved when it should have rejected with ${expected}`);
			}
			// all the result need to be same as expected, as error expected is true and no err catch
			// to determine what to put here :)
			// expect(result).to.deep.equal(expected);
			expect(result).to.have.deep.members(expected);
		}

		before(async function () {
			facade = new InsightFacade();

			// Add the datasets to InsightFacade once.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises: Promise<string[]>[] = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset("rooms", roomSection, InsightDatasetKind.Rooms),
			];

			try {
				await Promise.all(loadDatasetPromises);
			} catch (err) {
				throw new Error(`In PerformQuery Before hook, dataset(s) failed to be added. \n${err}`);
			}
		});

		after(async function () {
			await clearDisk();
		});

		// Examples demonstrating how to test performQuery using the JSON Test Queries.
		// The relative path to the query file must be given in square brackets.
		// valid
		it("[valid/simple.json] SELECT dept, avg WHERE avg > 97", checkQuery);
		it("[valid/complex.json] SELECT dept, avg, id WHERE (avg > 90 and dept = 'adhe') or avg > 95", checkQuery);
		it("[valid/rightAsterisks.json] Query with right asterisks", checkQuery);
		it("[valid/emptyOutput.json] Query with empty output", checkQuery);
		it("[valid/withNot.json] Query with not", checkQuery);
		it("[valid/allColumns.json] All columns shown", checkQuery);
		it("[valid/oneAsterisk.json] Query with only one Asterisk", checkQuery);
		it("[valid/twoAsterisk.json] Query with two Asterisk", checkQuery);
		it("[valid/withLT.json] Query with LT", checkQuery);
		it("[valid/whereNotInColumn.json] Query where not in column", checkQuery);
		it("[valid/validCapitalization.json] Valid Capitalization", checkQuery);
		it("[valid/orderBeforeColumns.json] Order before columns", checkQuery);
		it("[valid/RoomQueryExample.json] Room Query Example", checkQuery);
		it("[valid/SectionAggregation.json] SectionAggregation Example", checkQuery);
		it("[valid/TestMin.json] TestMin Example", checkQuery);
		it("[valid/TestCount.json] TestCount Example", checkQuery);
		it("[valid/TestSum.json] TestSum Example", checkQuery);
		it("[valid/TestAvg.json] TestAvg Example", checkQuery);
		it("[valid/TestMultipleApply.json] TestMultipleApply Example", checkQuery);
		it("[valid/TestNonNumCount.json] TestNonNumCount Example", checkQuery);
		// it("[valid/TestEmptyDataset.json] TestNonNumCount Example", checkQuery);
		it("[valid/TestMultipleSort.json] Test Multiple Sorting Rules", checkQuery);

		//invalid
		it("[invalid/invalid.json] Query missing WHERE", checkQuery);
		it("[invalid/tooLargeResultTest.json] Query result too large", checkQuery);
		//it("[invalid/referenceDifferentDataset.json] Query two dataset", checkQuery);
		it("[invalid/nonAddDataset.json] Query dataset that is not add", checkQuery);
		it("[invalid/missOptions.json] Query missing OPTIONS", checkQuery);
		it("[invalid/orderOutsideOptions.json] EBNF order not in option", checkQuery);
		it("[invalid/withUnderscoreID.json] Query with Underscore", checkQuery);
		it("[invalid/wrongAsterisks.json] EBNF asterisks inside strings", checkQuery);
		it("[invalid/missUnderscore.json] Query with no underscore between ID and fields", checkQuery);
		it("[invalid/nonExistField.json] EBNF non exist field", checkQuery);
		it("[invalid/isWithValue.json] EBNF is with value", checkQuery);
		it("[invalid/gtWithString.json] EBNF GT with string", checkQuery);
		it("[invalid/gtWithWrongKey.json] EBNF GT with wrong key type", checkQuery);
		it("[invalid/isWithWrongKey.json] EBNF IS with wrong key type", checkQuery);
		it("[invalid/missLogic.json] EBNF miss logic for two key", checkQuery);
		it("[invalid/withNoInGT.json] EBNF with NOT in GT", checkQuery);
		it("[invalid/withOnlyNot.json] EBNF with Only Not", checkQuery);
		it("[invalid/withNoColumn.json] Query with no columns", checkQuery);
		it("[invalid/capitalization.json] Query with capitalization", checkQuery);
		it("[invalid/orderNotInOptions.json] Query with order not in options", checkQuery);
		it("[invalid/invalidFilterKey.json] EBNF invalid filter key", checkQuery);
		it("[invalid/invalidCompareKey.json] EBNF invalid compare key", checkQuery);
		it("[invalid/invalidCompareKey.json] EBNF miss columns in options", checkQuery);
		it("[invalid/invalidColumnExistInJson.json] EBNF Invalid Column exist in Json", checkQuery);
		it("[invalid/emptyDatasetName.json] Query empty dataset name", checkQuery);
		it("[invalid/andWithTwoKey.json] And with two key", checkQuery);
		it("[invalid/withNoFilter.json] Logic with no filter", checkQuery);
		it("[invalid/notButNoObject.json] Not but no object", checkQuery);
		it("[invalid/gtWithTwoKey.json] GT with two key", checkQuery);
		it("[invalid/isWithTwoKey.json] IS with two key", checkQuery);
		it("[invalid/notWithTwoKey.json] NOT with two key", checkQuery);
		it("[invalid/invalidKeyInOptions.json] Invalid key in options", checkQuery);
		it("[invalid/invalidKeyInColumns.json] Invalid key in columns", checkQuery); //may be duplicated
		it("[invalid/invalidKeyInM.json] Invalid key in M", checkQuery);
		it("[invalid/invalidKeyInS.json] Invalid key in S", checkQuery);
		it("[invalid/invalidFilterKeyInNot.json] Invalid filter key in not", checkQuery);
		it("[invalid/filterInFilter.json] cannot have filter in filter", checkQuery);
		it("[invalid/Invalid_Type_Avg.json] Invalid Avg Input Type", checkQuery);
		it("[invalid/Invalid_Apply_Rule.json] Missing Condition in Apply", checkQuery);
		it("[invalid/Duplicate_Apply.json] Duplicate Apply Conditions", checkQuery);
		it("[invalid/Invalid_Apply_key.json] Invalid Apply Key", checkQuery);
		// it("[invalid/invalidColumnType.json] Invalid column type", checkQuery);
	});
});
