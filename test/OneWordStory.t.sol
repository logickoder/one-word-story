// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Test, console2} from "forge-std/Test.sol";
import {OneWordStory} from "../src/OneWordStory.sol";

/**
 * @title OneWordStoryTest
 * @dev Test suite for the OneWordStory contract.
 */
contract OneWordStoryTest is Test {
    OneWordStory public oneWordStory;

    function setUp() public {
        oneWordStory = new OneWordStory();
    }

    function test_AddFirstWord() public {
        string memory word = "Hello";
        // Expect an event to be emitted
        vm.expectEmit(true, true, true, true);
        emit OneWordStory.WordAdded(address(this), word, block.timestamp);

        oneWordStory.addWord(word);

        // Check if the story length is now 1
        assertEq(oneWordStory.getStoryLength(), 1);
        // Check if the first word is correctly stored
        assertEq(oneWordStory.getStory()[0], word);
        // Check if the latest word is correct
        assertEq(oneWordStory.getLatestWord(), word);
    }

    function test_AddMultipleWords() public {
        oneWordStory.addWord("First");
        oneWordStory.addWord("Second");
        oneWordStory.addWord("Third");

        // Check the final story length
        assertEq(oneWordStory.getStoryLength(), 3);

        // Check individual words
        assertEq(oneWordStory.getStory()[0], "First");
        assertEq(oneWordStory.getStory()[1], "Second");
        assertEq(oneWordStory.getStory()[2], "Third");

        // Check the latest word
        assertEq(oneWordStory.getLatestWord(), "Third");
    }

    function testRevert_AddEmptyWord() public {
        vm.expectRevert("Word cannot be empty");
        oneWordStory.addWord("");
    }

    function testRevert_AddWordWithSpace() public {
        vm.expectRevert("Word must be a single word (no spaces)");
        oneWordStory.addWord("two words");
    }

    function testRevert_GetLatestWord_EmptyStory() public {
        // We haven't added any words yet, so this should revert.
        vm.expectRevert("Story is empty");
        oneWordStory.getLatestWord();
    }


    function testEvent_WordAdded() public {
        address testSender = address(0xBEEF);
        string memory testWord = "Foundry";
        uint256 testTimestamp = 123456789;

        // Use vm.prank to simulate calling the function from a specific address.
        vm.startPrank(testSender);

        // Expect the event with specific arguments
        vm.expectEmit(true, true, false, true); // contributor (indexed), word (indexed), timestamp (not indexed), any order

        emit OneWordStory.WordAdded(testSender, testWord, testTimestamp);

        vm.warp(testTimestamp); // Sets the block.timestamp for the next call

        oneWordStory.addWord(testWord);

        vm.stopPrank();
    }
}