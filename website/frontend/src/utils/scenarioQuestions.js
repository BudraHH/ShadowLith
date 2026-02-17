/**
 * SCENARIO_QUESTIONS
 * Content that represents the "input" detected from the user's screen.
 */
export const SCENARIO_QUESTIONS = {
    Coding: {
        title: "1. Course Schedule",
        taskInfo: "Question 1 of 3",
        questions: [
            { id: 1, title: "Course Schedule", status: "active" },
            { id: 2, title: "Network Delay Time", status: "locked" },
            { id: 3, title: "Min Cost Flow", status: "locked" }
        ],
        problem: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.\n\nReturn the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.",
        examples: [
            {
                id: "01",
                input: 'numCourses = 2, prerequisites = [[1,0]]',
                output: "[0,1]",
                explanation: 'There are a total of 2 courses to take. To take course 1 you should have finished course 0. So the correct course order is [0,1].'
            },
            {
                id: "02",
                input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]',
                output: "[0,2,1,3]",
                explanation: 'There are a total of 4 courses to take. To take course 3 you should have finished both courses 1 and 2. Both courses 1 and 2 should be taken after you finished course 0. So one correct course order is [0,1,2,3]. Another correct ordering is [0,2,1,3].'
            }
        ],
        constraints: [
            "1 <= numCourses <= 2000",
            "0 <= prerequisites.length <= numCourses * (numCourses - 1)",
            "prerequisites[i].length == 2",
            "0 <= ai, bi < numCourses",
            "ai != bi",
            "All the pairs [ai, bi] are distinct."
        ],
    },
    MCQ: {
        title: "Question 08",
        section: "Algorithms",
        activeQuestion: 8,
        timer: "00:42:19",
        questions: [
            { id: 1, status: "complete" },
            { id: 2, status: "complete" },
            { id: 3, status: "complete" },
            { id: 4, status: "complete" },
            { id: 5, status: "complete" },
            { id: 6, status: "complete" },
            { id: 7, status: "complete" },
            { id: 8, status: "active" },
            ...Array.from({ length: 15 }, (_, i) => ({
                id: i + 9,
                status: "pending"
            }))
        ],
        question: "Which of the following approaches is most efficient for finding a Minimum Spanning Tree (MST) in a large, sparse graph?",
        correctAnswer: "C",
        options: [
            { label: "A", content: "Using a Priority Queue with a Min-Heap property to track edge weights." },
            { label: "B", content: "Implementing an Adjacency Matrix and performing an O(V^2) scan for the nearest neighbor." },
            { label: "C", content: "Utilizing a Disjoint Set Union (DSU) to detect cycles while sorting edges by weight." },
            { label: "D", content: "Applying a simple Breadth-First Search (BFS) to traverse all reachable vertices." }
        ]
    },
    Interview: {
        title: "Database & SQL Optimization",
        problem: "Sarah (Interviewer): 'Great. Now, could you open a notepad and walk me through how you'd optimize this join? Assume we have a Users table and a Orders table with millions of rows. Write a SQL query that retrieves the top 5 customers by spend in the last 30 days.'"
    }
};
