export const MOCK_MCQ_EXPLANATION = {
    "summary": "Event Loop Architecture",
    "blocks": [
        {
            "type": "problem",
            "content": "The question asks where a setTimeout callback goes before it is executed. In a single-threaded environment like JavaScript, the callback is offloaded to the Web APIs container until the timer expires, at which point it enters the Callback Queue. It only executes once the Call Stack is empty."
        }
    ]
};

export const MOCK_MCQ_ANSWER = {
    "summary": "Queue Selection",
    "blocks": [
        { "type": "option", "label": "B", "content": "It is moved to the Web API container and then to the Callback Queue." }
    ]
};

export const MOCK_HISTORY = [
    {
        explanationData: {
            summary: "Brute Force Analysis",
            blocks: [
                { type: "problem", content: "Identify all possible substrings and check each for character uniqueness. This is the most basic approach to solving the problem." },
                { type: "strategy", content: "Use a triple nested loop: the first two loops define the start and end of the substring, while the third loop checks for unique characters within that range." },
                { type: "interview", content: "I'd start with a naive approach to establish a baseline. By scanning every possible substring, we guarantee the correct answer, but it's computationally expensive for large strings due to re-calculating overlapping subproblems." }
            ]
        },
        data: {
            summary: "Naive Implementation",
            blocks: [
                { type: "code", lang: "java", content: "public int lengthOfLongestSubstring(String s) {\n    int n = s.length(), res = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j <= n; j++) {\n            if (allUnique(s, i, j)) res = Math.max(res, j - i);\n        }\n    }\n    return res;\n}\n\nprivate boolean allUnique(String s, int start, int end) {\n    Set<Character> set = new HashSet<>();\n    for (int i = start; i < end; i++) {\n        Character ch = s.charAt(i);\n        if (set.contains(ch)) return false;\n        set.add(ch);\n    }\n    return true;\n}" },
                { type: "step", content: "Define window boundaries using two outer loops (O(n^2))." },
                { type: "step", content: "Check for duplicates in the current window using a Set (O(n))." },
                { type: "step", content: "Track the maximum window size across all scans." },
                { type: "analysis", time: "O(n^3)", space: "O(min(n, m))", label: "Initial Naive Approach" }
            ]
        }
    },
    {
        explanationData: {
            summary: "Linear Sliding Window",
            blocks: [
                { type: "problem", content: "Avoid cubic complexity by using a sliding window that moves across the string in a single pass." },
                { type: "strategy", content: "Maintain a HashSet for characters in the current window. Expand the right side (j). If a duplicate appears, shrink from the left (i) until the window is valid again." },
                { type: "interview", content: "We can optimize this to O(n) using a sliding window. instead of re-scanning, we maintain a set of the current window. This 'telescoping' effect ensures we only visit each character twice (once by the right pointer, once by the left)." }
            ]
        },
        data: {
            summary: "HashSet Window (v2)",
            blocks: [
                { type: "code", lang: "java", content: "public int lengthOfLongestSubstring(String s) {\n    int n = s.length();\n    Set<Character> set = new HashSet<>();\n    int ans = 0, i = 0, j = 0;\n    while (i < n && j < n) {\n        if (!set.contains(s.charAt(j))) {\n            set.add(s.charAt(j++));\n            ans = Math.max(ans, j - i);\n        } else {\n            set.remove(s.charAt(i++));\n        }\n    }\n    return ans;\n}" },
                { type: "step", content: "Utilize a HashSet for O(1) character existence lookups." },
                { type: "step", content: "Iterate with a right pointer 'j' to expand the distinct character window." },
                { type: "step", content: "Contract the left pointer 'i' when a duplicity collision occurs." },
                { type: "analysis", time: "O(n)", space: "O(min(n, m))", label: "Sliding Window Improvement" }
            ]
        }
    },
    {
        explanationData: {
            summary: "Optimized HashMap Jump",
            blocks: [
                { type: "problem", content: "Further optimize the sliding window by skipping unnecessary contraction steps." },
                { type: "strategy", content: "Use a HashMap to store the NEXT index a pointer should jump to if a character is repeated. This allows the left pointer to 'jump' directly past the duplicate." },
                { type: "interview", content: "To reach peak performance, I'd use a HashMap to store character indices. When a repeat is found, the left pointer can immediately jump to the correct position without a while-loop. This is the industrial standard for this problem." }
            ]
        },
        data: {
            summary: "HashMap Optimized (Final)",
            blocks: [
                { type: "code", lang: "java", content: "public int lengthOfLongestSubstring(String s) {\n    int n = s.length(), ans = 0;\n    Map<Character, Integer> map = new HashMap<>();\n    for (int j = 0, i = 0; j < n; j++) {\n        if (map.containsKey(s.charAt(j))) {\n            i = Math.max(map.get(s.charAt(j)), i);\n        }\n        ans = Math.max(ans, j - i + 1);\n        map.put(s.charAt(j), j + 1);\n    }\n    return ans;\n}" },
                { type: "step", content: "Store the character index + 1 in the map for instant repositioning." },
                { type: "step", content: "The 'i' pointer jumps to the last seen position, skipping redundant lookups." },
                { type: "step", content: "Calculate the total window size in a single O(n) pass with zero re-traversal." },
                { type: "analysis", time: "O(n)", space: "O(min(n, m))", label: "Ultimate Performance Optimized" }
            ]
        }
    }
];
