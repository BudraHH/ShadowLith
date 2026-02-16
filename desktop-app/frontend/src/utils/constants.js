export const MOCK_EXPLANATION = {
    "text1": `I am currently working on a high-performance financial modeling application in Python that requires real-time calculation of Fibonacci sequences to model potential market growth patterns. The application receives a stream of input integers, often ranging up to 10,000 or more, and needs to compute the corresponding Fibonacci number instantly.

My current implementation uses a standard recursive approach, which was simple to write and easy to understand initially. However, as I've started testing with larger numbers (n > 35), I've noticed a significant degradation in performance. For inputs around n=40, the calculation takes several seconds, freezing the UI. For inputs approaching n=50, it effectively hangs the application. Furthermore, when I try to test with the required n=10,000, the application immediately crashes with a "RecursionError: maximum recursion depth exceeded" message.

I understand that the naive recursive solution recalculates values multiple times, leading to an exponential time complexity. I strictly need a solution that can handle n=10,000 without crashing and returns the result in under 100ms. Space complexity is also a concern as this runs on a resource-constrained container.

Here is the problematic code I am currently using:`,
    "code1": `def fibonacci_recursive(n):
    """
    Calculates the n-th Fibonacci number recursively.
    WARNING: highly inefficient for n > 30
    """
    if n < 0:
        raise ValueError("Input must be non-negative")
    if n == 0:
        return 0
    if n == 1:
        return 1
    
    # Recursive step - potential stack overflow
    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)

# Trying to run this with n=10000 causes a crash
# print(fibonacci_recursive(10000))`,
    "text2": `I have tried increasing the system recursion limit using 'sys.setrecursionlimit()', but that only pushes the crash further out or results in a segmentation fault due to stack overflow.

Refactoring requirements:
1.  Eliminate the recursion depth issue entirely.
2.  Ensure the solution runs in O(n) time complexity or better.
3.  Minimize memory usage (O(1) space complexity would be ideal).
4.  The solution must be Pythonic and easy to maintain.

Could you please provide a robust, iterative solution? I've heard about "dynamic programming" and "matrix exponentiation" but I'm not sure which is best for this specific range (n=10,000). Also, please explain *why* the recursive version is failing so badly compared to the iterative one.`
};

export const MOCK_ANSWER = {
    "text1": `The performance issues you are experiencing are due to the fundamental properties of the naive recursive algorithm. Your current implementation has an exponential time complexity of O(2^n), meaning the number of operations doubles with every small increase in 'n'. For n=40, the computer performs hundreds of millions of operations. For n=10,000, the number of operations is astronomically large, far exceeding the age of the universe in nanoseconds. Additionally, Python's recursion limit (usually 1000) prevents deep stacks to protect the memory, hence the crash.

To solve this efficiently for n=10,000, we should abandon recursion in favor of an iterative approach (Bottom-Up Dynamic Programming). This approach builds the solution from the ground up, storing only the necessary previous values. This reduces the Time Complexity to O(n) and, crucially, allows us to optimize Space Complexity to O(1) by only keeping track of the last two numbers.

Here is the optimized, production-ready implementation:`,
    "code1": `def fibonacci_iterative_optimized(n):
    """
    Calculates the n-th Fibonacci number iteratively.
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if n < 0:
        raise ValueError("Input must be non-negative")
    if n == 0:
        return 0
    if n == 1:
        return 1

    # Initialize the first two numbers
    # a stores F(i-2), b stores F(i-1)
    a, b = 0, 1

    # Iterate from 2 to n
    for _ in range(2, n + 1):
        # Compute numbers in place without a list
        a, b = b, a + b
        
    return b

# Test with n=10000 (No crash, instant result)
# print(fibonacci_iterative_optimized(10000))`,
    "text2": `### Analysis of Improvements

1.  **Time Complexity O(n)**:
    Instead of recalculating values purely, we calculate each number exactly once. For n=10,000, this loop runs 10,000 times, which a modern CPU can execute in microseconds.

2.  **Space Complexity O(1)**:
    Notice we are not using an array like \`dp = [0] * (n+1)\`. We only track variables \`a\` and \`b\`. This keeps memory usage constant regardless of how large \`n\` becomes (excluding the inherent memory required to store the large integer result itself).

3.  **Recursion Limit Bypassed**:
    Since this uses a standard \`for\` loop, the call stack never grows deeper than the current function frame. \`sys.setrecursionlimit\` is no longer needed, and there is no risk of StackOverflowError.

### Alternative: Matrix Exponentiation
For extremely large inputs (e.g., n > 1,000,000), a Matrix Exponentiation approach would yield O(log n) time complexity. However, for n=10,000, the O(n) iterative solution is virtually instant and maintains higher code readability. Given your requirements, the iterative approach above is the best balance of performance and maintainability.`
};
