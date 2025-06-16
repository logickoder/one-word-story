// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

/**
 * @title OneWordStory
 * @dev A simple smart contract for building a collaborative story, one word at a time.
 */
contract OneWordStory {
    string[] public story;

    // An event that will be emitted whenever a new word is added.
    event WordAdded(
        address indexed contributor, // Who added the word
        string word,                 // The word that was added
        uint256 timestamp            // When the word was added
    );

    /**
     * @dev Adds a single word to the story.
     * @param _newWord The word to be added. Must not contain spaces.
     */
    function addWord(string memory _newWord) public {
        require(bytes(_newWord).length > 0, "Word cannot be empty");

        require(!_containsSpace(_newWord), "Word must be a single word (no spaces)");

        story.push(_newWord);

        emit WordAdded(msg.sender, _newWord, block.timestamp);
    }

    /**
     * @dev Returns the full story as an array of words.
     */
    function getStory() public view returns (string[] memory) {
        return story;
    }

    /**
     * @dev Returns the total number of words in the story.
     */
    function getStoryLength() public view returns (uint256) {
        return story.length;
    }

    /**
     * @dev Returns just the last word added to the story.
     * Will revert if the story is empty.
     */
    function getLatestWord() public view returns (string memory) {
        require(story.length > 0, "Story is empty");
        return story[story.length - 1];
    }

    /**
     * @dev Helper function to check if a string contains a space.
     * @param _text The string to check.
     * @return True if the string contains a space, false otherwise.
     */
    function _containsSpace(string memory _text) internal pure returns (bool) {
        bytes memory b = bytes(_text);
        for (uint i = 0; i < b.length; i++) {
            if (b[i] == 0x20) { // 0x20 is the ASCII code for a space
                return true;
            }
        }
        return false;
    }
}