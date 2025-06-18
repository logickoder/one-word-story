// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {OneWordStory} from "../src/OneWordStory.sol";

contract OneWordStoryScript is Script {
    OneWordStory public story;

    function setUp() public {}

    function run() public {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        story = new OneWordStory();

        vm.stopBroadcast();

        console.log("One Word Story deployed to:", address(story));
    }
}
