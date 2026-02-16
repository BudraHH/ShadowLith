export const MOCK_CODING_EXPLANATION = {
    "summary": "Recursion Depth & Performance Jitter",
    "complexity": "O(2^n)",
    "blocks": [
        {
            "type": "text",
            "content": "I am currently working on a high-performance financial modeling application in Python that requires real-time calculation of Fibonacci sequences. The application receives a stream of input integers, often ranging up to 10,000 or more."
        },
        {
            "type": "warning",
            "content": "Current inputs approaching n=50 effectively hang the application with a RecursionError."
        },
        {
            "type": "code",
            "lang": "python",
            "content": "def fibonacci_recursive(n):\n    if n <= 1: return n\n    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)"
        },
        {
            "type": "text",
            "content": "I strictly need a solution that can handle n=10,000 without crashing and returns the result in under 100ms."
        }
    ]
};

export const MOCK_CODING_ANSWER = {
    "summary": "Optimized Iterative Fibonacci",
    "complexity": "O(n)",
    "blocks": [
        {
            "type": "text",
            "content": "The performance issues are due to exponential time complexity O(2^n). We should abandon recursion for a simple iterative loop."
        },
        {
            "type": "code",
            "lang": "python",
            "content": "def fibonacci_iterative(n):\n    if n < 2: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b"
        },
        {
            "type": "text",
            "content": "This approach reduces memory usage to O(1) constant space."
        },
        {
            "type": "step",
            "content": "1. Initialize variables a and b to 0 and 1."
        },
        {
            "type": "step",
            "content": "2. Loop from 2 to n, updating values in-place."
        },
        {
            "type": "step",
            "content": "3. Return the final value of b."
        }
    ]
};

export const MOCK_MCQ_EXPLANATION = {
    "summary": "JavaScript Event Loop Basics",
    "complexity": null,
    "blocks": [
        {
            "type": "text",
            "content": "Which of the following describes the behavior of the JavaScript Event Loop when handling asynchronous tasks like setTimeout?"
        },
        { "type": "option", "label": "A", "content": "It executes immediately on the main thread." },
        { "type": "option", "label": "B", "content": "It is moved to the Web API container and then to the Callback Queue." },
        { "type": "option", "label": "C", "content": "It creates a new thread for each timer." },
        { "type": "option", "label": "D", "content": "It blocks the execution of the next line of code until finished." }
    ]
};

export const MOCK_MCQ_ANSWER = {
    "summary": "Event Loop Selection",
    "complexity": "Conceptual",
    "blocks": [
        {
            "type": "text",
            "content": "The correct answer is **B) It is moved to the Web API container and then to the Callback Queue.**"
        },
        {
            "type": "warning",
            "content": "Common mistake: Thinking JavaScript is multi-threaded because of asynchronous behavior. It is single-threaded with an event loop."
        },
        {
            "type": "step",
            "content": "1. Main script execution finishes."
        },
        {
            "type": "step",
            "content": "2. Call stack becomes empty."
        },
        {
            "type": "step",
            "content": "3. Event Loop pulls tasks from Callback Queue into the Call Stack."
        }
    ]
};
