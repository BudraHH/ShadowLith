/**
 * SCENARIO_UI_DATA
 * SHADOWLITH's internal state and generated outputs.
 */
export const SCENARIO_UI_DATA = {
    Coding: {
        explanationData: {
            summary: "Kahn's BFS Algorithm",
            blocks: [
                { type: "strategy", content: "To solve the course ordering problem, we treat courses as nodes in a Directed Acyclic Graph (DAG) and prerequisites as edges. We then apply Kahn's Algorithm for Topological Sort. By maintaining an in-degree array, we can iteratively process courses that have no remaining dependencies, effectively building a valid completion sequence." },
                { type: "interview", content: "I'm using Kahn's algorithm here instead of a DFS-based approach because it's more intuitive for cycle detection and handles disconnected components efficiently. The BFS ensures that we always pick a node with zero in-degree, which is the exact industrial requirement for task scheduling systems like Airflow or CI/CD pipelines." }
            ]
        },
        data: {
            summary: "Topological Sort (Java)",
            blocks: [
                { type: "code", lang: "java", content: "public int[] findOrder(int n, int[][] pre) {\n    List<List<Integer>> adj = new ArrayList<>();\n    int[] inDegree = new int[n];\n    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n    \n    for (int[] p : pre) {\n        adj.get(p[1]).add(p[0]);\n        inDegree[p[0]]++;\n    }\n\n    Queue<Integer> q = new LinkedList<>();\n    for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.offer(i);\n\n    int[] result = new int[n];\n    int idx = 0;\n    while (!q.isEmpty()) {\n        int curr = q.poll();\n        result[idx++] = curr;\n        for (int next : adj.get(curr)) {\n            if (--inDegree[next] == 0) q.offer(next);\n        }\n    }\n\n    return idx == n ? result : new int[0];\n}" },
                { type: "step", content: "Build an adjacency list and calculate the in-degree (number of prerequisites) for each course." },
                { type: "step", content: "Add all courses with an in-degree of 0 (no prerequisites) to a BFS queue." },
                { type: "step", content: "While the queue is not empty, pop a course, add it to the result, and decrement the in-degree of its dependent courses." },
                { type: "step", content: "If a dependent course's in-degree reaches 0, add it to the queue." },
                { type: "analysis", time: "O(V + E)", space: "O(V + E)", label: "Linear Performance" }
            ]
        }
    },
    MCQ: {
        explanationData: {
            summary: "MST Algorithm Analysis",
            blocks: [
                { type: "reasoning", content: "Option C is correct because Kruskal's algorithm, powered by a Disjoint Set Union (DSU), scales linearly with edges ($O(E \log E)$). In a sparse graph, where $E$ is close to $V$, Kruskal's avoids the $O(V^2)$ overhead of an Adjacency Matrix (Option B) and the vertex-priority management of Prim's (Option A). BFS (Option D) is irrelevant as it doesn't account for edge weights." }
            ]
        },
        data: {
            summary: "AI Reasoning Result",
            blocks: [
                { type: "analysis", time: "O(E log E)", space: "O(V + E)", label: "Optimal Selection" }
            ]
        }
    },
    Interview: {
        explanationData: {
            summary: "SQL Indexing & Joins",
            blocks: [
                { type: "problem", content: "The interviewer is testing your ability to optimize database performance at scale. They want to see if you can handle aggregations over millions of rows without causing performance bottlenecks, specifically looking for knowledge of indexing and efficient join strategies." },
                { type: "strategy", content: "The most efficient approach is to use a Common Table Expression (CTE) to pre-aggregate the data. By filtering and grouping the Orders table before joining with the Users table, we drastically reduce the work the database engine has to do." }
            ]
        },
        data: {
            summary: "SQL Performance Guide",
            blocks: [
                { type: "interview", content: "To handle this at scale, I'd avoid a naive join. I'd first pre-filter the orders from the last 30 days using a CTE. This keeps the join set small. I'd also recommend a composite index on 'created_at' and 'user_id'. This allows the engine to perform the heavy lifting directly in the index tree, avoiding expensive heap lookups." },
                { type: "code", lang: "sql", content: "WITH RecentSpend AS (\n    SELECT user_id, SUM(total_amount) as total_spend\n    FROM Orders\n    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'\n    GROUP BY user_id\n    ORDER BY total_spend DESC\n    LIMIT 5\n)\nSELECT u.name, u.email, rs.total_spend\nFROM Users u\nJOIN RecentSpend rs ON u.id = rs.user_id;" },
                { type: "step", content: "Define a CTE named 'RecentSpend' to isolate the window of interest." },
                { type: "step", content: "Filter the Orders table by the last 30 days using the 'created_at' column." },
                { type: "step", content: "Aggregate the spend by grouping by 'user_id' and limit the results to the top 5." },
                { type: "step", content: "Join the resulting top 5 user IDs back to the 'Users' table to pull in names." },
                { type: "step", content: "Finalize the SELECT statement with the required columns." }
            ]
        }
    }
};
