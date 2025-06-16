// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {OneWordStory} from "../src/OneWordStory.sol";

contract OneWordStoryScript is Script {
    OneWordStory public counter;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        counter = new OneWordStory();

        vm.stopBroadcast();
    }
}
