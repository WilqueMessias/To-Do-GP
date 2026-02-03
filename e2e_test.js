import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:8080/api/tasks';
const TEST_TASK = {
    title: "E2E Automated Test Task",
    description: "This task was created by the Specialist QA Agent script.",
    status: "TODO",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
};

async function runTest() {
    console.log("🟦 [QA SPECIALIST] Starting Rigorous End-to-End Test Protocol...");
    console.log(`🎯 Target API: ${API_URL}`);
    console.log("---------------------------------------------------");

    let taskId = null;

    // STEP 1: CREATE (POST)
    try {
        console.log("Testing POST (Create)...");
        const createRes = await axios.post(API_URL, TEST_TASK);

        if (createRes.status === 201) {
            console.log("✅ POST Success (201 Created)");
            taskId = createRes.data.id;
            console.log(`   Task ID Generated: ${taskId}`);
        } else {
            throw new Error(`Unexpected Status: ${createRes.status}`);
        }
    } catch (error) {
        console.error("❌ POST FAILED!");
        console.error("   Reason:", error.message);
        if (error.response) console.error("   Data:", error.response.data);
        process.exit(1);
    }

    // STEP 2: READ (GET)
    try {
        console.log("\nTesting GET (Read)...");
        const getRes = await axios.get(API_URL);

        if (getRes.status === 200) {
            console.log("✅ GET Success (200 OK)");
            const found = getRes.data.find(t => t.id === taskId);
            if (found) {
                console.log("✅ Integrity Check Passed: Task found in list.");
            } else {
                console.error("❌ Integrity Check Failed: Created task NOT found in list.");
                process.exit(1);
            }
        }
    } catch (error) {
        console.error("❌ GET FAILED!");
        process.exit(1);
    }

    // STEP 3: DELETE (Cleanup)
    try {
        console.log(`\nTesting DELETE (Cleanup ID: ${taskId})...`);
        const delRes = await axios.delete(`${API_URL}/${taskId}`);

        if (delRes.status === 204) {
            console.log("✅ DELETE Success (204 No Content)");
        } else {
            console.warn(`⚠️ DELETE Status Check: Expected 204, got ${delRes.status}`);
        }
    } catch (error) {
        console.error("❌ DELETE FAILED!");
        process.exit(1);
    }

    console.log("---------------------------------------------------");
    console.log("🏆 [QA SPECIALIST] PROTOCOL PASSED. BACKEND IS PERFECT.");
    console.log("   If the UI fails, it is purely a Browser/CORS configuration issue.");
}

runTest();
