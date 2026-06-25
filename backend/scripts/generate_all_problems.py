import os
import json
import shutil

# Root directory of backend
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROBLEMS_DIR = os.path.join(BACKEND_DIR, "problems")
PROBLEMS_JSON_PATH = os.path.join(BACKEND_DIR, "app", "problems.json")

# Define problem data
PROBLEMS_DATA = [
  # ── ARRAY ───────────────────────────────────────────────────────────
  {
    "id": "two-sum",
    "title": "Two Sum",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
      {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
    ],
    "hints": [
      "Can you use a hash map to store the elements you've seen?",
      "As you iterate through the array, calculate the complement (target - current).",
      "Check if the complement exists in your hash map to find the answer in O(N) time."
    ],
    "similar_questions": [{"title": "3Sum", "difficulty": "Medium", "slug": "3sum"}]
  },
  {
    "id": "contains-duplicate",
    "title": "Contains Duplicate",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\nInput format: A single line representing a JSON array of integers, e.g. [1,2,3,1].",
    "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[1,2,3,1]", "output": "true"},
      {"input": "[1,2,3,4]", "output": "false"}
    ],
    "hints": [
      "Sorting the array can group duplicates together, but takes O(N log N) time.",
      "Can you use a hash set to keep track of the elements you've already seen?",
      "If you try to add an element to the hash set and it's already there, you've found a duplicate."
    ],
    "similar_questions": [{"title": "Contains Duplicate II", "difficulty": "Easy", "slug": "contains-duplicate-ii"}]
  },
  {
    "id": "product-of-array-except-self",
    "title": "Product of Array Except Self",
    "difficulty": "Medium",
    "tags": ["Array"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.\n\nInput format: A single line representing a JSON array of integers, e.g. [1,2,3,4].",
    "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[1,2,3,4]", "output": "[24,12,8,6]"},
      {"input": "[-1,1,0,-3,3]", "output": "[0,0,9,0,0]"}
    ],
    "hints": [
      "Think about how you can use prefix and suffix products.",
      "You can compute all prefix products in one pass, storing them in an array.",
      "In a second pass from right to left, compute suffix products and multiply them with the prefix products to get the answer."
    ],
    "similar_questions": []
  },
  {
    "id": "maximum-subarray",
    "title": "Maximum Subarray",
    "difficulty": "Medium",
    "tags": ["Array", "Dynamic Programming"],
    "programs": ["dsa"],
    "description": "Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nInput format: A single line representing a JSON array of integers, e.g. [-2,1,-3,4,-1,2,1,-5,4].",
    "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6"},
      {"input": "[5,4,-1,7,8]", "output": "23"}
    ],
    "hints": [
      "If all numbers are negative, the answer is the largest single number.",
      "Use Kadane's algorithm to keep a running sum.",
      "If the running sum becomes negative, reset it to zero because it would only decrease the sum of any future subarray."
    ],
    "similar_questions": []
  },
  # ── STRING ──────────────────────────────────────────────────────────
  {
    "id": "reverse-string",
    "title": "Reverse String",
    "difficulty": "Easy",
    "tags": ["Two Pointers", "String"],
    "programs": ["dsa", "neetcode"],
    "description": "Write a function that reverses a string. The input string is given as an array of characters.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\nInput format: A single line representing a JSON list of single-character strings.",
    "constraints": ["1 <= s.length <= 10^5"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[\"h\",\"e\",\"l\",\"l\",\"o\"]", "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"},
      {"input": "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "output": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]"}
    ],
    "hints": [
      "You need to modify the input array in-place.",
      "Use two pointers, one at the start and one at the end of the array.",
      "Swap the elements at the two pointers and move them towards the center until they meet."
    ],
    "similar_questions": []
  },
  {
    "id": "valid-palindrome",
    "title": "Valid Palindrome",
    "difficulty": "Easy",
    "tags": ["Two Pointers", "String"],
    "programs": ["dsa", "neetcode"],
    "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nInput format: A single line containing the phrase.",
    "constraints": ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "A man, a plan, a canal: Panama", "output": "true"},
      {"input": "race a car", "output": "false"}
    ],
    "hints": [
      "First, filter the string to keep only alphanumeric characters and convert to lowercase.",
      "You can use two pointers starting from both ends of the filtered string.",
      "Move the pointers inward and check if the characters match at every step."
    ],
    "similar_questions": []
  },
  {
    "id": "longest-common-prefix",
    "title": "Longest Common Prefix",
    "difficulty": "Easy",
    "tags": ["String"],
    "programs": ["dsa"],
    "description": "Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string.\n\nInput format: A single line containing a JSON list of strings.",
    "constraints": ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[\"flower\",\"flow\",\"flight\"]", "output": "fl"},
      {"input": "[\"dog\",\"racecar\",\"car\"]", "output": ""}
    ],
    "hints": [
      "If the array is empty, return an empty string.",
      "Start by assuming the first string is the common prefix.",
      "Iterate through the rest of the strings and keep shortening the prefix from the end until it matches the beginning of the current string."
    ],
    "similar_questions": []
  },
  # ── HASH TABLE ──────────────────────────────────────────────────────
  {
    "id": "valid-anagram",
    "title": "Valid Anagram",
    "difficulty": "Easy",
    "tags": ["Hash Table", "String"],
    "programs": ["dsa", "neetcode"],
    "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nInput format: Two lines, s on the first line and t on the second.",
    "constraints": ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "anagram\nnagaram", "output": "true"},
      {"input": "rat\ncar", "output": "false"}
    ],
    "hints": [
      "Two strings are anagrams if they have the same characters with the exact same frequencies.",
      "You can sort both strings and compare them, but it takes O(N log N) time.",
      "For an O(N) approach, use a hash map or an array of size 26 to count character frequencies."
    ],
    "similar_questions": []
  },
  {
    "id": "group-anagrams",
    "title": "Group Anagrams",
    "difficulty": "Medium",
    "tags": ["Hash Table", "String"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nInput format: A single line representing a JSON array of strings.",
    "constraints": ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}
    ],
    "hints": [
      "Anagrams will be identical if you sort their characters.",
      "Use a hash map where the key is the sorted version of the string.",
      "Alternatively, use the character frequency count array as the key to avoid the O(K log K) sorting step."
    ],
    "similar_questions": []
  },
  # ── TWO POINTERS ────────────────────────────────────────────────────
  {
    "id": "container-with-most-water",
    "title": "Container With Most Water",
    "difficulty": "Medium",
    "tags": ["Two Pointers", "Array"],
    "programs": ["dsa", "neetcode"],
    "description": "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nInput format: A JSON array of heights.",
    "constraints": ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[1,8,6,2,5,4,8,3,7]", "output": "49"},
      {"input": "[1,1]", "output": "1"}
    ],
    "hints": [
      "The area is constrained by the shorter vertical line.",
      "Use two pointers starting at both ends of the array.",
      "To maximize the area, always move the pointer that points to the shorter line inward."
    ],
    "similar_questions": []
  },
  {
    "id": "3sum",
    "title": "3Sum",
    "difficulty": "Medium",
    "tags": ["Two Pointers", "Array"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nInput format: A JSON array of integers.",
    "constraints": ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"}
    ],
    "hints": [
      "This is an extension of the Two Sum problem. Try fixing one number first.",
      "Sort the array first to make avoiding duplicates and using two pointers easier.",
      "For each fixed number, use two pointers on the remaining array to find pairs that sum to -fixed_number."
    ],
    "similar_questions": []
  },
  # ── SLIDING WINDOW ──────────────────────────────────────────────────
  {
    "id": "best-time-to-buy-and-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "Easy",
    "tags": ["Array", "Sliding Window"],
    "programs": ["dsa", "neetcode"],
    "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nInput format: A JSON array of stock prices.",
    "constraints": ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[7,1,5,3,6,4]", "output": "5"},
      {"input": "[7,6,4,3,1]", "output": "0"}
    ],
    "hints": [
      "You want to buy at the lowest possible price and sell at the highest possible price after buying.",
      "Keep track of the minimum price seen so far as you iterate through the array.",
      "At each step, calculate the potential profit if you sell today, and update the maximum profit."
    ],
    "similar_questions": []
  },
  {
    "id": "longest-substring-without-repeating-characters",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Medium",
    "tags": ["Hash Table", "String", "Sliding Window"],
    "programs": ["dsa", "neetcode"],
    "description": "Given a string s, find the length of the longest substring without repeating characters.\n\nInput format: A single line of text.",
    "constraints": ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "abcabcbb", "output": "3"},
      {"input": "bbbbb", "output": "1"},
      {"input": "pwwkew", "output": "3"}
    ],
    "hints": [
      "Use a sliding window approach with two pointers (left and right).",
      "Use a hash set to keep track of the characters in the current window.",
      "If the right character is already in the set, remove characters from the left until the duplicate is gone."
    ],
    "similar_questions": []
  },
  # ── STACK ───────────────────────────────────────────────────────────
  {
    "id": "valid-parentheses",
    "title": "Valid Parentheses",
    "difficulty": "Easy",
    "tags": ["Stack", "String"],
    "programs": ["dsa", "neetcode"],
    "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if opening brackets are closed by the same type of brackets, and in the correct order.\n\nInput format: A single line containing the string.",
    "constraints": ["1 <= s.length <= 10^4", "s consists of parentheses only."],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "()", "output": "true"},
      {"input": "()[]{}", "output": "true"},
      {"input": "(]", "output": "false"}
    ],
    "hints": [
      "An opening bracket must be closed by the same type of bracket.",
      "Use a stack to keep track of the opening brackets you've seen.",
      "When you encounter a closing bracket, check if it matches the top of the stack and pop it."
    ],
    "similar_questions": []
  },
  {
    "id": "min-stack",
    "title": "Min Stack",
    "difficulty": "Medium",
    "tags": ["Stack", "Design"],
    "programs": ["dsa", "neetcode"],
    "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nInput format:\nLine 1: A JSON array of commands (strings: \"MinStack\", \"push\", \"pop\", \"top\", \"getMin\").\nLine 2: A JSON array of arguments lists corresponding to commands.",
    "constraints": ["Methods called <= 3 * 10^4 times"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {
        "input": "[\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"]\n[[],[-2],[0],[-3],[],[],[],[]]",
        "output": "[null,null,null,null,-3,null,0,-2]"
      }
    ],
    "hints": [
      "Consider storing pairs of (value, current_minimum) in the stack.",
      "Alternatively, use a secondary stack to only keep track of the minimum values.",
      "When pushing a new value, the new minimum is the min(new_value, current_minimum)."
    ],
    "similar_questions": []
  },
  # ── BINARY SEARCH ───────────────────────────────────────────────────
  {
    "id": "binary-search",
    "title": "Binary Search",
    "difficulty": "Easy",
    "tags": ["Binary Search", "Array"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nInput format:\nLine 1: A JSON array of sorted integers.\nLine 2: A target integer.",
    "constraints": ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All integers in nums are unique."],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[-1,0,3,5,9,12]\n9", "output": "4"},
      {"input": "[-1,0,3,5,9,12]\n2", "output": "-1"}
    ],
    "hints": [
      "Since the array is sorted, you don't need to check every element.",
      "Use two pointers to define the search range (left and right).",
      "Find the middle element and adjust your range based on whether the target is larger or smaller than the middle element."
    ],
    "similar_questions": []
  },
  {
    "id": "search-in-rotated-sorted-array",
    "title": "Search in Rotated Sorted Array",
    "difficulty": "Medium",
    "tags": ["Binary Search", "Array"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an integer array nums sorted in ascending order (with distinct values), which is possibly rotated at an unknown pivot index, and a target integer, return its index if found, else -1.\n\nInput format:\nLine 1: JSON array of rotated integers.\nLine 2: Target integer.",
    "constraints": ["1 <= nums.length <= 5000", "-10^4 <= nums[i], target <= 10^4"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[4,5,6,7,0,1,2]\n0", "output": "4"},
      {"input": "[4,5,6,7,0,1,2]\n3", "output": "-1"}
    ],
    "hints": [
      "Even though the array is rotated, at least one half of the array will always be perfectly sorted.",
      "Find the middle element and determine which half (left or right) is sorted.",
      "Check if the target falls within the sorted half's range. If it does, search there; otherwise, search the other half."
    ],
    "similar_questions": []
  },
  {
    "id": "find-minimum-in-rotated-sorted-array",
    "title": "Find Minimum in Rotated Sorted Array",
    "difficulty": "Medium",
    "tags": ["Binary Search", "Array"],
    "programs": ["dsa", "neetcode"],
    "description": "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Find the minimum element of this array.\n\nInput format: A JSON array of rotated distinct integers.",
    "constraints": ["n == nums.length", "1 <= n <= 5000", "-5000 <= nums[i] <= 5000"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[3,4,5,1,2]", "output": "1"},
      {"input": "[4,5,6,7,0,1,2]", "output": "0"}
    ],
    "hints": [
      "If the array is not rotated, the first element is the minimum.",
      "Use binary search. Compare the middle element with the rightmost element.",
      "If the middle element is greater than the rightmost, the minimum must be in the right half."
    ],
    "similar_questions": []
  },
  # ── LINKED LIST ─────────────────────────────────────────────────────
  {
    "id": "reverse-linked-list",
    "title": "Reverse Linked List",
    "difficulty": "Easy",
    "tags": ["Linked List"],
    "programs": ["dsa", "neetcode"],
    "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nInput format: A JSON array of integers representing the linked list node values.",
    "constraints": ["0 <= list.length <= 5000", "-5000 <= Node.val <= 5000"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[1,2,3,4,5]", "output": "[5,4,3,2,1]"},
      {"input": "[1,2]", "output": "[2,1]"}
    ],
    "hints": [
      "You need to reverse the direction of the pointers.",
      "Keep track of three nodes: previous, current, and next.",
      "Iterate through the list, changing current.next to point to previous, then move previous and current one step forward."
    ],
    "similar_questions": []
  },
  {
    "id": "merge-two-sorted-lists",
    "title": "Merge Two Sorted Lists",
    "difficulty": "Easy",
    "tags": ["Linked List"],
    "programs": ["dsa", "neetcode"],
    "description": "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.\n\nInput format:\nLine 1: A JSON array of integers for list1.\nLine 2: A JSON array of integers for list2.",
    "constraints": ["0 <= list1.length, list2.length <= 50", "-100 <= Node.val <= 100"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[1,2,4]\n[1,3,4]", "output": "[1,1,2,3,4,4]"}
    ],
    "hints": [
      "Use a dummy node to simplify the edge cases of inserting at the head.",
      "Keep a pointer to the current tail of the merged list.",
      "Compare the current nodes of both lists, attach the smaller one to the tail, and advance the pointers."
    ],
    "similar_questions": []
  },
  # ── TREES ───────────────────────────────────────────────────────────
  {
    "id": "maximum-depth-of-binary-tree",
    "title": "Maximum Depth of Binary Tree",
    "difficulty": "Easy",
    "tags": ["Trees", "Depth-First Search", "Binary Tree"],
    "programs": ["dsa", "neetcode"],
    "description": "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.\n\nInput format: A JSON array representing level-order traversal (including nulls), e.g. [3,9,20,null,null,15,7].",
    "constraints": ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[3,9,20,null,null,15,7]", "output": "3"},
      {"input": "[1,null,2]", "output": "2"}
    ],
    "hints": [
      "The depth of a tree is the maximum depth of its left or right subtrees, plus 1 for the root.",
      "You can use recursion (DFS) to find the depth of each subtree.",
      "Alternatively, use a queue (BFS) to traverse the tree level by level, counting the number of levels."
    ],
    "similar_questions": []
  },
  {
    "id": "invert-binary-tree",
    "title": "Invert Binary Tree",
    "difficulty": "Easy",
    "tags": ["Trees", "Depth-First Search", "Binary Tree"],
    "programs": ["dsa", "neetcode"],
    "description": "Given the root of a binary tree, invert the tree, and return its root.\n\nInput format: A JSON array representing level-order traversal (including nulls), e.g. [4,2,7,1,3,6,9].\nOutput format: Level-order traversal array of the inverted tree.",
    "constraints": ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]"},
      {"input": "[2,1,3]", "output": "[2,3,1]"}
    ],
    "hints": [
      "Inverting a tree means swapping the left and right children of every node.",
      "You can do this recursively by swapping the children and then calling the function on the children.",
      "A level-order traversal using a queue also works perfectly for swapping at each node."
    ],
    "similar_questions": []
  },
  {
    "id": "binary-tree-level-order-traversal",
    "title": "Binary Tree Level Order Traversal",
    "difficulty": "Medium",
    "tags": ["Trees", "Breadth-First Search", "Binary Tree"],
    "programs": ["dsa"],
    "description": "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e. from left to right, level by level).\n\nInput format: A JSON array representing level-order traversal (including nulls), e.g. [3,9,20,null,null,15,7].\nOutput format: A JSON array of lists, grouping values by tree level.",
    "constraints": ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]"},
      {"input": "[1]", "output": "[[1]]"}
    ],
    "hints": [
      "You need to group the nodes level by level.",
      "Use a queue to perform a Breadth-First Search (BFS).",
      "In each step, process all nodes currently in the queue, as they belong to the same level, and enqueue their children for the next step."
    ],
    "similar_questions": []
  },
  # ── DYNAMIC PROGRAMMING ─────────────────────────────────────────────
  {
    "id": "climbing-stairs",
    "title": "Climbing Stairs",
    "difficulty": "Easy",
    "tags": ["Dynamic Programming", "Math"],
    "programs": ["dsa", "neetcode"],
    "description": "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\nInput format: An integer.",
    "constraints": ["1 <= n <= 45"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "2", "output": "2"},
      {"input": "3", "output": "3"}
    ],
    "hints": [
      "To reach step N, you must have come from either step N-1 or step N-2.",
      "The number of ways to reach step N is the sum of ways to reach N-1 and N-2. This is the Fibonacci sequence.",
      "Use variables to store the last two results to optimize space instead of a full array."
    ],
    "similar_questions": []
  },
  {
    "id": "house-robber",
    "title": "House Robber",
    "difficulty": "Medium",
    "tags": ["Dynamic Programming"],
    "programs": ["dsa", "neetcode"],
    "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected.\n\nDetermine the maximum amount of money you can rob tonight without alerting the police.\n\nInput format: A JSON array of integers.",
    "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[1,2,3,1]", "output": "4"},
      {"input": "[2,7,9,3,1]", "output": "12"}
    ],
    "hints": [
      "If you rob house i, you cannot rob house i-1, but you can rob i-2.",
      "Let dp[i] be the maximum money you can rob up to house i. Then dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
      "You only need to keep track of the max money from the last two houses to save space."
    ],
    "similar_questions": []
  },
  {
    "id": "coin-change",
    "title": "Coin Change",
    "difficulty": "Medium",
    "tags": ["Dynamic Programming", "Breadth-First Search"],
    "programs": ["dsa", "neetcode"],
    "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nInput format:\nLine 1: A JSON array of coins.\nLine 2: An integer amount.",
    "constraints": ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[1,2,5]\n11", "output": "3"},
      {"input": "[2]\n3", "output": "-1"}
    ],
    "hints": [
      "A greedy approach (taking the largest coin first) does not always yield the minimum number of coins.",
      "Use dynamic programming. Let dp[i] be the minimum coins to make amount i.",
      "For each amount from 1 to the target, try all coins and update dp[i] = min(dp[i], dp[i - coin] + 1)."
    ],
    "similar_questions": []
  },
  # ── SORTING ─────────────────────────────────────────────────────────
  {
    "id": "merge-sort",
    "title": "Merge Sort",
    "difficulty": "Medium",
    "tags": ["Sorting", "Divide and Conquer"],
    "programs": ["dsa"],
    "description": "Given an array of integers, sort the array in ascending order using the Merge Sort algorithm.\n\nInput format: A JSON array of integers.\nOutput format: Sorted JSON array.",
    "constraints": ["1 <= nums.length <= 50000", "-5 * 10^4 <= nums[i] <= 5 * 10^4"],
    "time_limit": 3.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[5,2,3,1]", "output": "[1,2,3,5]"},
      {"input": "[5,1,1,2,0,0]", "output": "[0,0,1,1,2,5]"}
    ],
    "hints": [
      "Merge sort is a divide-and-conquer algorithm.",
      "Recursively divide the array into two halves until each half has only one element.",
      "Merge the two sorted halves back together in O(N) time."
    ],
    "similar_questions": []
  },
  {
    "id": "kth-largest-element-in-an-array",
    "title": "Kth Largest Element in an Array",
    "difficulty": "Medium",
    "tags": ["Sorting", "Heap (Priority Queue)", "Quickselect"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an integer array nums and an integer k, return the kth largest element in the array.\n\nInput format:\nLine 1: A JSON array of integers.\nLine 2: An integer k.",
    "constraints": ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[3,2,1,5,6,4]\n2", "output": "5"},
      {"input": "[3,2,3,1,2,4,5,5,6]\n4", "output": "4"}
    ],
    "hints": [
      "Sorting the array and picking the kth element works but takes O(N log N) time.",
      "You can use a Min-Heap of size K to keep track of the K largest elements. This takes O(N log K) time.",
      "For O(N) average time complexity, use the Quickselect algorithm."
    ],
    "similar_questions": []
  },
  # ── MATH/BIT ────────────────────────────────────────────────────────
  {
    "id": "single-number",
    "title": "Single Number",
    "difficulty": "Easy",
    "tags": ["Math", "Bit Manipulation"],
    "programs": ["dsa", "neetcode"],
    "description": "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.\n\nInput format: A JSON array of integers.",
    "constraints": ["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "[2,2,1]", "output": "1"},
      {"input": "[4,1,2,1,2]", "output": "4"}
    ],
    "hints": [
      "You could use a hash set to track numbers, but that takes O(N) extra space.",
      "Think about bitwise operations, specifically XOR.",
      "XORing a number with itself gives 0, and XORing any number with 0 gives the number. If you XOR all elements, the duplicates will cancel out."
    ],
    "similar_questions": []
  },
  {
    "id": "counting-bits",
    "title": "Counting Bits",
    "difficulty": "Easy",
    "tags": ["Dynamic Programming", "Bit Manipulation"],
    "programs": ["dsa", "neetcode"],
    "description": "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.\n\nInput format: An integer.\nOutput format: A JSON array.",
    "constraints": ["0 <= n <= 10^5"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "2", "output": "[0,1,1]"},
      {"input": "5", "output": "[0,1,1,2,1,2]"}
    ],
    "hints": [
      "You can count the bits for each number using a loop, which takes O(N log N) time.",
      "Try to find a pattern. How does the number of set bits in 'x' relate to the number of set bits in 'x / 2'?",
      "The number of set bits in 'i' is the same as 'i >> 1' plus 1 if 'i' is odd."
    ],
    "similar_questions": []
  },
  # ── SYSTEM TEST CASES ────────────────────────────────────────────────
  {
    "id": "infinite-loop",
    "title": "Infinite Loop Tester",
    "difficulty": "Hard",
    "tags": ["System", "TLE Test"],
    "programs": ["system"],
    "description": "A program that loops infinitely.\n\nUsed to verify Time Limit Exceeded (TLE) detection in the sandboxed judge.\n\nThis problem intentionally has no valid solution — any submitted code that loops forever should receive a TLE verdict.",
    "constraints": ["Time Limit: 1 second", "Any infinite loop must be killed within the time limit."],
    "time_limit": 1.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "", "output": "(none — should TLE)"}
    ],
    "hints": [
      "This is a system test to check Time Limit Exceeded (TLE) handling.",
      "Write a `while True:` loop to ensure the execution never terminates normally.",
      "The sandbox should kill the process after the time limit expires."
    ],
    "similar_questions": []
  },
  {
    "id": "fork-bomb",
    "title": "Fork Bomb Tester",
    "difficulty": "Hard",
    "tags": ["System", "PID Limit Test"],
    "programs": ["system"],
    "description": "A program that recursively spawns child processes until the PID limit is hit.\n\nUsed to verify process limit (pids_limit=64) enforcement in the Docker sandbox.\n\nAny code that fork-bombs should be terminated by the container's PID limit.",
    "constraints": ["PID limit enforced: 64 processes per container", "Time Limit: 2 seconds"],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "", "output": "(none — should RE or TLE)"}
    ],
    "hints": [
      "This is a system test to ensure process limits are enforced.",
      "Spawn multiple child processes continuously (e.g. using fork() or threading).",
      "The sandbox should catch this and terminate with a Runtime Error or similar limit exceeded status."
    ],
    "similar_questions": []
  },
  {
    "id": "memory-leak",
    "title": "Memory Leak Tester",
    "difficulty": "Hard",
    "tags": ["System", "MLE Test"],
    "programs": ["system"],
    "description": "A program that allocates large amounts of memory until the container is OOM-killed.\n\nUsed to verify Memory Limit Exceeded (MLE) detection via Linux kernel OOM killer (cgroups).",
    "constraints": ["Memory Limit: 256MB", "Allocating beyond 256MB must yield MLE verdict."],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "", "output": "(none — should MLE)"}
    ],
    "hints": [
      "This is a system test to verify Memory Limit Exceeded (MLE) handling.",
      "Allocate a massive array or list and keep appending to it in an infinite loop.",
      "The sandbox should terminate the code once memory goes beyond the limit."
    ],
    "similar_questions": []
  },
  {
    "id": "runtime-error",
    "title": "Runtime Error Tester",
    "difficulty": "Medium",
    "tags": ["System", "RE Test"],
    "programs": ["system"],
    "description": "A program that crashes or exits with a non-zero status code.\n\nUsed to verify Runtime Error (RE) detection in the judge.\n\nExamples include: division by zero, null pointer dereference, array out-of-bounds, or explicit exit(1).",
    "constraints": ["Any non-zero exit code should yield an RE verdict.", "Stderr output is captured and displayed."],
    "time_limit": 2.0,
    "memory_limit": 256,
    "sample_cases": [
      {"input": "", "output": "(none — should RE)"}
    ],
    "hints": [
      "This is a system test to check non-zero exit code handling.",
      "You can raise an Exception, divide by zero, or simply `exit(1)`.",
      "The sandbox should intercept this and report a Runtime Error verdict."
    ],
    "similar_questions": []
  }
]

# Reference Solutions to evaluate expected outputs
def contains_duplicate_ref(input_str: str) -> str:
    arr = json.loads(input_str.strip())
    res = len(arr) != len(set(arr))
    return "true" if res else "false"

def product_of_array_except_self_ref(input_str: str) -> str:
    nums = json.loads(input_str.strip())
    n = len(nums)
    res = [1] * n
    left = 1
    for i in range(n):
        res[i] = left
        left *= nums[i]
    right = 1
    for i in range(n-1, -1, -1):
        res[i] *= right
        right *= nums[i]
    return json.dumps(res)

def maximum_subarray_ref(input_str: str) -> str:
    nums = json.loads(input_str.strip())
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return str(max_so_far)

def reverse_string_ref(input_str: str) -> str:
    arr = json.loads(input_str.strip())
    return json.dumps(arr[::-1])

def valid_palindrome_ref(input_str: str) -> str:
    s = input_str.strip()
    clean = [c.lower() for c in s if c.isalnum()]
    res = clean == clean[::-1]
    return "true" if res else "false"

def longest_common_prefix_ref(input_str: str) -> str:
    strs = json.loads(input_str.strip())
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix

def valid_anagram_ref(input_str: str) -> str:
    lines = [l.strip() for l in input_str.strip().splitlines() if l.strip()]
    if len(lines) < 2:
        return "false"
    res = sorted(lines[0]) == sorted(lines[1])
    return "true" if res else "false"

def group_anagrams_ref(input_str: str) -> str:
    strs = json.loads(input_str.strip())
    groups = {}
    for s in strs:
        key = "".join(sorted(s))
        groups.setdefault(key, []).append(s)
    # Sort groups in a stable way
    sorted_groups = []
    for k in sorted(groups.keys()):
        sorted_groups.append(sorted(groups[k]))
    sorted_groups.sort(key=lambda x: (len(x), x))
    return json.dumps(sorted_groups)

def container_with_most_water_ref(input_str: str) -> str:
    height = json.loads(input_str.strip())
    l, r = 0, len(height) - 1
    max_w = 0
    while l < r:
        max_w = max(max_w, (r - l) * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return str(max_w)

def three_sum_ref(input_str: str) -> str:
    nums = json.loads(input_str.strip())
    nums.sort()
    res = []
    for i in range(len(nums)):
        if i > 0 and nums[i] == nums[i-1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l+1]:
                    l += 1
                while l < r and nums[r] == nums[r-1]:
                    r -= 1
                l += 1
                r -= 1
    return json.dumps(res)

def max_profit_ref(input_str: str) -> str:
    prices = json.loads(input_str.strip())
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        min_price = min(min_price, p)
        max_profit = max(max_profit, p - min_price)
    return str(max_profit)

def length_of_longest_substring_ref(input_str: str) -> str:
    s = input_str.strip()
    char_map = {}
    max_len = 0
    start = 0
    for end in range(len(s)):
        if s[end] in char_map:
            start = max(start, char_map[s[end]] + 1)
        char_map[s[end]] = end
        max_len = max(max_len, end - start + 1)
    return str(max_len)

def valid_parentheses_ref(input_str: str) -> str:
    s = input_str.strip()
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return "false"
        else:
            stack.append(char)
    res = not stack
    return "true" if res else "false"

def min_stack_ref(input_str: str) -> str:
    lines = [l.strip() for l in input_str.strip().splitlines() if l.strip()]
    cmds = json.loads(lines[0])
    args = json.loads(lines[1])
    stack = []
    min_stack = []
    output = []
    for i in range(len(cmds)):
        cmd = cmds[i]
        arg = args[i]
        if cmd == "MinStack":
            output.append(None)
        elif cmd == "push":
            val = arg[0]
            stack.append(val)
            if not min_stack or val <= min_stack[-1]:
                min_stack.append(val)
            output.append(None)
        elif cmd == "pop":
            if stack:
                val = stack.pop()
                if min_stack and val == min_stack[-1]:
                    min_stack.pop()
            output.append(None)
        elif cmd == "top":
            output.append(stack[-1] if stack else None)
        elif cmd == "getMin":
            output.append(min_stack[-1] if min_stack else None)
    return json.dumps(output)

def binary_search_ref(input_str: str) -> str:
    lines = [l.strip() for l in input_str.strip().splitlines() if l.strip()]
    nums = json.loads(lines[0])
    target = int(lines[1])
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return str(mid)
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return "-1"

def search_rotated_ref(input_str: str) -> str:
    lines = [l.strip() for l in input_str.strip().splitlines() if l.strip()]
    nums = json.loads(lines[0])
    target = int(lines[1])
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return str(mid)
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]:
                r = mid - 1
            else:
                l = mid + 1
        else:
            if nums[mid] < target <= nums[r]:
                l = mid + 1
            else:
                r = mid - 1
    return "-1"

def find_min_ref(input_str: str) -> str:
    nums = json.loads(input_str.strip())
    l, r = 0, len(nums) - 1
    while l < r:
        mid = (l + r) // 2
        if nums[mid] > nums[r]:
            l = mid + 1
        else:
            r = mid
    return str(nums[l])

def reverse_list_ref(input_str: str) -> str:
    arr = json.loads(input_str.strip())
    return json.dumps(arr[::-1])

def merge_lists_ref(input_str: str) -> str:
    lines = [l.strip() for l in input_str.strip().splitlines() if l.strip()]
    l1 = json.loads(lines[0]) if lines else []
    l2 = json.loads(lines[1]) if len(lines) > 1 else []
    return json.dumps(sorted(l1 + l2))

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def deserialize_tree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if node is not None:
            if i < len(arr) and arr[i] is not None:
                node.left = TreeNode(arr[i])
                queue.append(node.left)
            else:
                node.left = None
            i += 1
            if i < len(arr) and arr[i] is not None:
                node.right = TreeNode(arr[i])
                queue.append(node.right)
            else:
                node.right = None
            i += 1
    return root

def serialize_tree(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result

def max_depth_ref(input_str: str) -> str:
    arr = json.loads(input_str.strip())
    root = deserialize_tree(arr)
    def depth(node):
        if not node: return 0
        return 1 + max(depth(node.left), depth(node.right))
    return str(depth(root))

def invert_tree_ref(input_str: str) -> str:
    arr = json.loads(input_str.strip())
    root = deserialize_tree(arr)
    def invert(node):
        if not node: return
        node.left, node.right = node.right, node.left
        invert(node.left)
        invert(node.right)
    invert(root)
    return json.dumps(serialize_tree(root))

def level_order_ref(input_str: str) -> str:
    arr = json.loads(input_str.strip())
    root = deserialize_tree(arr)
    if not root: return "[]"
    res = []
    q = [root]
    while q:
        level = []
        for _ in range(len(q)):
            curr = q.pop(0)
            level.append(curr.val)
            if curr.left: q.append(curr.left)
            if curr.right: q.append(curr.right)
        res.append(level)
    return json.dumps(res)

def climb_stairs_ref(input_str: str) -> str:
    n = int(input_str.strip())
    if n <= 2: return str(n)
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return str(b)

def rob_ref(input_str: str) -> str:
    nums = json.loads(input_str.strip())
    if not nums: return "0"
    if len(nums) == 1: return str(nums[0])
    prev2, prev1 = 0, 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return str(prev1)

def coin_change_ref(input_str: str) -> str:
    lines = [l.strip() for l in input_str.strip().splitlines() if l.strip()]
    coins = json.loads(lines[0])
    amount = int(lines[1])
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    return str(dp[amount] if dp[amount] != float('inf') else -1)

def merge_sort_ref(input_str: str) -> str:
    arr = json.loads(input_str.strip())
    arr.sort()
    return json.dumps(arr)

def find_kth_largest_ref(input_str: str) -> str:
    lines = [l.strip() for l in input_str.strip().splitlines() if l.strip()]
    nums = json.loads(lines[0])
    k = int(lines[1])
    nums.sort(reverse=True)
    return str(nums[k-1])

def single_number_ref(input_str: str) -> str:
    nums = json.loads(input_str.strip())
    res = 0
    for n in nums:
        res ^= n
    return str(res)

def count_bits_ref(input_str: str) -> str:
    n = int(input_str.strip())
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return json.dumps(ans)


# Dictionary mapping problem ID to reference function
REF_SOLUTIONS = {
    "contains-duplicate": contains_duplicate_ref,
    "product-of-array-except-self": product_of_array_except_self_ref,
    "maximum-subarray": maximum_subarray_ref,
    "reverse-string": reverse_string_ref,
    "valid-palindrome": valid_palindrome_ref,
    "longest-common-prefix": longest_common_prefix_ref,
    "valid-anagram": valid_anagram_ref,
    "group-anagrams": group_anagrams_ref,
    "container-with-most-water": container_with_most_water_ref,
    "3sum": three_sum_ref,
    "best-time-to-buy-and-sell-stock": max_profit_ref,
    "longest-substring-without-repeating-characters": length_of_longest_substring_ref,
    "valid-parentheses": valid_parentheses_ref,
    "min-stack": min_stack_ref,
    "binary-search": binary_search_ref,
    "search-in-rotated-sorted-array": search_rotated_ref,
    "find-minimum-in-rotated-sorted-array": find_min_ref,
    "reverse-linked-list": reverse_list_ref,
    "merge-two-sorted-lists": merge_lists_ref,
    "maximum-depth-of-binary-tree": max_depth_ref,
    "invert-binary-tree": invert_tree_ref,
    "binary-tree-level-order-traversal": level_order_ref,
    "climbing-stairs": climb_stairs_ref,
    "house-robber": rob_ref,
    "coin-change": coin_change_ref,
    "merge-sort": merge_sort_ref,
    "kth-largest-element-in-an-array": find_kth_largest_ref,
    "single-number": single_number_ref,
    "counting-bits": count_bits_ref,
}

# Explicit Inputs for each problem to generate test cases
TEST_INPUTS = {
    "contains-duplicate": [
        "[1,2,3,1]",
        "[1,2,3,4]",
        "[1,1,1,3,3,4,3,2,4,2]"
    ],
    "product-of-array-except-self": [
        "[1,2,3,4]",
        "[-1,1,0,-3,3]",
        "[0,4,0]"
    ],
    "maximum-subarray": [
        "[-2,1,-3,4,-1,2,1,-5,4]",
        "[1]",
        "[5,4,-1,7,8]"
    ],
    "reverse-string": [
        '["h","e","l","l","o"]',
        '["H","a","n","n","a","h"]',
        '["A","B"]'
    ],
    "valid-palindrome": [
        "A man, a plan, a canal: Panama",
        "race a car",
        " "
    ],
    "longest-common-prefix": [
        '["flower","flow","flight"]',
        '["dog","racecar","car"]',
        '["prefix","pref","pre"]'
    ],
    "valid-anagram": [
        "anagram\nnagaram",
        "rat\ncar",
        "a\na"
    ],
    "group-anagrams": [
        '["eat","tea","tan","ate","nat","bat"]',
        '[""]',
        '["a"]'
    ],
    "container-with-most-water": [
        "[1,8,6,2,5,4,8,3,7]",
        "[1,1]",
        "[4,3,2,1,4]"
    ],
    "3sum": [
        "[-1,0,1,2,-1,-4]",
        "[0,1,1]",
        "[0,0,0]"
    ],
    "best-time-to-buy-and-sell-stock": [
        "[7,1,5,3,6,4]",
        "[7,6,4,3,1]",
        "[2,4,1]"
    ],
    "longest-substring-without-repeating-characters": [
        "abcabcbb",
        "bbbbb",
        "pwwkew"
    ],
    "valid-parentheses": [
        "()",
        "()[]{}",
        "(]"
    ],
    "min-stack": [
        '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]',
        '["MinStack","push","push","getMin","pop","getMin"]\n[[],[1],[2],[],[],[]]'
    ],
    "binary-search": [
        "[-1,0,3,5,9,12]\n9",
        "[-1,0,3,5,9,12]\n2",
        "[5]\n5"
    ],
    "search-in-rotated-sorted-array": [
        "[4,5,6,7,0,1,2]\n0",
        "[4,5,6,7,0,1,2]\n3",
        "[1]\n0"
    ],
    "find-minimum-in-rotated-sorted-array": [
        "[3,4,5,1,2]",
        "[4,5,6,7,0,1,2]",
        "[11,13,15,17]"
    ],
    "reverse-linked-list": [
        "[1,2,3,4,5]",
        "[1,2]",
        "[]"
    ],
    "merge-two-sorted-lists": [
        "[1,2,4]\n[1,3,4]",
        "[]\n[]",
        "[]\n[0]"
    ],
    "maximum-depth-of-binary-tree": [
        "[3,9,20,null,null,15,7]",
        "[1,null,2]",
        "[]"
    ],
    "invert-binary-tree": [
        "[4,2,7,1,3,6,9]",
        "[2,1,3]",
        "[]"
    ],
    "binary-tree-level-order-traversal": [
        "[3,9,20,null,null,15,7]",
        "[1]",
        "[]"
    ],
    "climbing-stairs": [
        "2",
        "3",
        "5"
    ],
    "house-robber": [
        "[1,2,3,1]",
        "[2,7,9,3,1]"
    ],
    "coin-change": [
        "[1,2,5]\n11",
        "[2]\n3",
        "[1]\n0"
    ],
    "merge-sort": [
        "[5,2,3,1]",
        "[5,1,1,2,0,0]"
    ],
    "kth-largest-element-in-an-array": [
        "[3,2,1,5,6,4]\n2",
        "[3,2,3,1,2,4,5,5,6]\n4"
    ],
    "single-number": [
        "[2,2,1]",
        "[4,1,2,1,2]",
        "[1]"
    ],
    "counting-bits": [
        "2",
        "5"
    ]
}

def main():
    print("Writing problems.json...")
    with open(PROBLEMS_JSON_PATH, "w") as f:
        json.dump(PROBLEMS_DATA, f, indent=2)

    print("Generating filesystem tests...")
    
    # We preserve two-sum and system tests inputs since they have custom requirements/existing structures
    # We recreate the other folders
    for prob in PROBLEMS_DATA:
        p_id = prob["id"]
        if p_id in ["two-sum", "infinite-loop", "fork-bomb", "memory-leak", "runtime-error"]:
            print(f"Skipping directory recreation for: {p_id} (preserved)")
            continue

        p_dir = os.path.join(PROBLEMS_DIR, p_id)
        if os.path.exists(p_dir):
            shutil.rmtree(p_dir)
        
        tests_dir = os.path.join(p_dir, "tests")
        os.makedirs(tests_dir, exist_ok=True)
        
        inputs = TEST_INPUTS.get(p_id, [])
        ref_func = REF_SOLUTIONS.get(p_id)
        
        if not inputs or not ref_func:
            print(f"WARNING: No inputs/ref_func for: {p_id}")
            continue
            
        for idx, inp in enumerate(inputs, start=1):
            case_dir = os.path.join(tests_dir, str(idx))
            os.makedirs(case_dir, exist_ok=True)
            
            # Generate output using Python reference implementation
            try:
                out = ref_func(inp)
            except Exception as e:
                print(f"ERROR: failed reference execution for {p_id} case {idx}: {e}")
                continue
                
            # Write to files
            with open(os.path.join(case_dir, "input.txt"), "w") as out_in:
                out_in.write(inp.strip() + "\n")
            with open(os.path.join(case_dir, "expected_output.txt"), "w") as out_exp:
                out_exp.write(out.strip() + "\n")
                
        print(f"Generated {len(inputs)} test cases for: {p_id}")

if __name__ == "__main__":
    main()
