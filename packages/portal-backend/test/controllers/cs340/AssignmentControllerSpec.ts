import {expect} from "chai";
import "mocha";

import {Test} from "../../GlobalSpec";

import {GradesController} from "../../../src/controllers/GradesController";
import {AssignmentController, AssignmentGrade} from "../../../src/controllers/340/AssignmentController";
import {RepositoryController} from "../../../src/controllers/RepositoryController";
import {TeamController} from "../../../src/controllers/TeamController";
import {Grade, Repository, Team} from "../../../src/Types";

const loadFirst = require('../../GlobalSpec');
const dFirst = require('../GradeControllerSpec');

const TEST_ORG = "CPSC340";
const TEST_STUDENT_ID_0 = "student0";
const TEST_STUDENT_ID_1 = "student1";
const TEST_STUDENT_ID_2 = "student2";
const TEST_STUDENT_ID_3 = "student3";

const TEST_STUDENT_MAP = [
    TEST_STUDENT_ID_0,
    TEST_STUDENT_ID_1,
    TEST_STUDENT_ID_2,
    TEST_STUDENT_ID_3
];

const TEST_REPO_ID = "A2_REPO_STUDENT0";

const TEST_ASSN_ID = "A2";


describe("AssignmentController", () => {
    let ac: AssignmentController = new AssignmentController();
    let gc: GradesController = new GradesController();
    let tc = new TeamController();
    let rc = new RepositoryController();

    before(async () => {
        // nothing
    });

    beforeEach(() => {
        // initialize a new controller before each tests
        ac = new AssignmentController();
    });

    it("Attempting to retrieve an assignment grade that doesn't exist should return null.", async () => {
        let assignmentGrades = await ac.getAssignmentGrade("student1", "a1");
        expect(assignmentGrades).equals(null);
    });

    it("Should be able to create an assignment grade.", async () => {
        // Check there is no grade associated with the assignment specified
        let assignmentGrade = await ac.getAssignmentGrade(TEST_STUDENT_ID_0, "a2");
        expect(assignmentGrade).equals(null);

        let aPayload = {
            assignmentID: "a2",
            studentID:    TEST_STUDENT_ID_0,
            questions:    [
                {
                    questionName: "Question 1",
                    commentName:  "",
                    subQuestion:  [
                        {
                            sectionName: "code",
                            grade:       4,
                            feedback:    "Good job!"
                        },
                        {
                            sectionName: "reasoning",
                            grade:       5,
                            feedback:    ""
                        }
                    ]
                },
                {
                    questionName: "Question 2",
                    commentName:  "",
                    subQuestion:  [
                        {
                            sectionName: "code",
                            grade:       2,
                            feedback:    "Improper implementation"
                        }
                    ]
                }
            ]
        };
        let team1: Team = await tc.getTeam(Test.TEAMNAME1);

        let repo2: Repository = await rc.createRepository(Test.REPONAME2, [team1], null);

        await ac.setAssignmentGrade(Test.REPONAME2, TEST_ASSN_ID, aPayload);

        let aGrade: AssignmentGrade = await ac.getAssignmentGrade(Test.USERNAME1, TEST_ASSN_ID);
        let grade: Grade = await gc.getGrade(Test.USERNAME1, TEST_ASSN_ID);
        // Check if the assignment information is set properly
        expect(aGrade).to.not.be.null;
        expect(aGrade.assignmentID).equals("a2");
        expect(aGrade.studentID).equals(TEST_STUDENT_ID_0);
        expect(aGrade.questions).to.have.lengthOf(2);

        // Check if the grade is set properly
        expect(grade).to.not.be.null;
        expect(grade.score).equals(11);
    });

    it("Should be able to update a grade.", async () => {
        let team1: Team = await tc.getTeam(Test.TEAMNAME1);
        let repo2: Repository = await rc.getRepository(Test.REPONAME2);

        let previousGradeRecords = await gc.getAllGrades(); // Pre command count

        let aPayload = {
            assignmentID: "a2",
            studentID:    TEST_STUDENT_ID_0,
            questions:    [
                {
                    questionName: "Question 1",
                    commentName:  "",
                    subQuestion:  [
                        {
                            sectionName: "code",
                            grade:       3,
                            feedback:    ""
                        }
                    ]
                },
                {
                    questionName: "Question 2",
                    commentName:  "",
                    subQuestion:  [
                        {
                            sectionName: "code",
                            grade:       5,
                            feedback:    "Nice job"
                        }
                    ]
                }
            ]
        };

        await ac.setAssignmentGrade(Test.REPONAME2, TEST_ASSN_ID, aPayload);

        let afterGradeRecords = await gc.getAllGrades(); // Post command count

        expect(previousGradeRecords.length - afterGradeRecords.length).to.equal(0);

        let grade: Grade = await gc.getGrade(Test.USERNAME1, TEST_ASSN_ID);
        expect(grade).to.not.be.null;
        expect(grade.score).to.equal(8);
    });

    it("Should be able to handle arbitrary subquestion sizes", async () => {
        let aPayload = {
            assignmentID: "a2",
            studentID:    TEST_STUDENT_ID_0,
            questions:    [
                {
                    questionName: "Question 1",
                    commentName:  "",
                    subQuestion:  [
                        {
                            sectionName: "code",
                            grade:       3,
                            feedback:    ""
                        },
                        {
                            sectionName: "writing",
                            grade:       1,
                            feedback:    ""
                        },
                        {
                            sectionName: "logic",
                            grade:       10,
                            feedback:    ""
                        },
                        {
                            sectionName: "quality",
                            grade:       6,
                            feedback:    ""
                        },
                        {
                            sectionName: "grammar",
                            grade:       6,
                            feedback:    ""
                        }
                    ]
                },
                {
                    questionName: "Question 2",
                    commentName:  "",
                    subQuestion:  [
                        {
                            sectionName: "code",
                            grade:       5,
                            feedback:    "Nice job"
                        }
                    ]
                }
            ]
        };

        let success = await ac.setAssignmentGrade(Test.REPONAME2, TEST_ASSN_ID, aPayload);
        expect(success).to.be.true;

        let newGrade = await gc.getGrade(Test.USERNAME1, TEST_ASSN_ID);
        expect(newGrade).to.not.be.null;
        expect(newGrade.score).to.be.equal(31);

        let aGrade = await ac.getAssignmentGrade(Test.USERNAME1, TEST_ASSN_ID);

        expect(aGrade.studentID).to.be.equal(aPayload.studentID);
        expect(aGrade.assignmentID).to.be.equal(aPayload.assignmentID);
    });
});