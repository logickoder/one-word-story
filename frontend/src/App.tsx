import { useCallback, useEffect, useState } from "react";
import { ethers } from 'ethers';
import OneWordStoryAbi from '../../out/OneWordStory.sol/OneWordStory.json';


export default function App() {
    const [currentAccount, setCurrentAccount] = useState<string | null>(null);
    const [story, setStory] = useState<string[]>([]);
    const [newWord, setNewWord] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    // Type for window.ethereum to avoid 'any'
    interface EthereumWindow extends Window {
        ethereum?: any; // MetaMask injects ethereum object
    }

    const checkIfWalletIsConnected = useCallback(async () => {
        try {
            const { ethereum } = window as EthereumWindow;
            if (!ethereum) {
                setError("Make sure you have MetaMask installed!");
                return;
            }
            const accounts: string[] = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);
                setupContract(ethereum);
            } else {
                console.log("No authorized account found");
            }
        } catch (err: any) {
            setError("Error connecting: " + err.message);
            console.error(err);
        }
    }, []);

    const connectWallet = useCallback(async () => {
        try {
            const { ethereum } = window as EthereumWindow;
            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }
            const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
            setupContract(ethereum);
        } catch (err: any) {
            setError("Error connecting: " + err.message);
            console.error(err);
        }
    }, []);

    const setupContract = useCallback((ethereum: any) => {
        try {
            const provider = new ethers.BrowserProvider(ethereum);
            // Signer is required to send transactions
            const signerPromise = provider.getSigner(); // getSigner returns a Promise
            signerPromise.then(signer => {
                const oneWordStoryContract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, OneWordStoryAbi.abi, signer);
                setContract(oneWordStoryContract);
                console.log("Contract initialized:", oneWordStoryContract);
            }).catch(err => {
                setError("Error getting signer: " + err.message);
                console.error(err);
            });

        } catch (err: any) {
            setError("Error setting up contract: " + err.message);
            console.error(err);
        }
    }, []);

    const fetchStory = useCallback(async () => {
        if (!contract) {
            console.log("Contract not initialized yet, skipping fetchStory.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const currentStory: string[] = await contract.getStory();
            setStory(currentStory);
        } catch (err: any) {
            setError("Failed to fetch story: " + err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [contract]);

    const handleAddWord = useCallback(async () => {
        if (!contract || !newWord.trim()) {
            setError("Please connect wallet and enter a word.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const tx = await contract.addWord(newWord.trim());
            await tx.wait(); // Wait for the transaction to be mined
            console.log("Word added, transaction confirmed:", tx.hash);
            setNewWord(''); // Clear the input field
            await fetchStory(); // Refresh the story after adding a word
        } catch (err: any) {
            let errorMessage = "Failed to add word.";
            if (err.reason) { // ethers v6 specific error reason
                errorMessage += ` Reason: ${err.reason}`;
            } else if (err.data && err.data.message) { // Fallback for older ethers/other errors
                errorMessage += ` Details: ${err.data.message}`;
            } else if (err.message) {
                errorMessage += ` Details: ${err.message}`;
            }
            setError(errorMessage);
            console.error("Error adding word:", err);
        } finally {
            setIsLoading(false);
        }
    }, [contract, newWord, fetchStory]); // Added fetchStory to deps

    // --- Lifecycle Hooks ---
    useEffect(() => {
        checkIfWalletIsConnected();
    }, [checkIfWalletIsConnected]); // Added checkIfWalletIsConnected to deps

    useEffect(() => {
        if (contract) {
            fetchStory();
            // Listen for WordAdded events
            // The ABI from Foundry's JSON includes events, so contract.filters.WordAdded() should work
            const filter = contract.filters.WordAdded as unknown as (contributor?: string, word?: string, timestamp?: ethers.BigNumber) => ethers.DeferredTopicFilter;

            const listener = (contributor: string, word: string, timestamp: ethers.BigNumber) => {
                console.log("WordAdded event received:", { contributor, word, timestamp: timestamp.toString() });
                fetchStory(); // Re-fetch the story to include the new word
            };
            contract.on(filter(), listener);

            // Cleanup listener on component unmount or contract change
            return () => {
                contract.off(filter(), listener);
            };
        }
    }, [contract, fetchStory]); // Added fetchStory to deps

    return (
        // Main container: slightly darker background, centered content
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            {/* App Card: White background, large shadow, rounded corners */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center w-full max-w-4xl border border-gray-100">
                {/* Header Section */}
                <header className="mb-10">
                    <h1 className="text-6xl font-extrabold text-green-700 mb-4 tracking-tight leading-tight">
                        One Word Story <span className="text-blue-500">📖</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Collaborate on an ever-growing tale, one word at a time, on the blockchain.
                    </p>
                    {!currentAccount ? (
                        <button
                            onClick={connectWallet}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                            Connect Wallet
                        </button>
                    ) : (
                        <p className="text-lg text-gray-700 font-medium bg-green-100 py-2 px-4 rounded-full inline-block">
                            Connected: <span className="font-mono text-green-800 break-words">{currentAccount.substring(0, 6)}...{currentAccount.substring(currentAccount.length - 4)}</span>
                        </p>
                    )}
                </header>

                {/* Main Content Area */}
                <main>
                    {/* Story Display Section */}
                    <section className="mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 border-b-2 border-green-300 pb-3">The Story So Far:</h2>
                        {isLoading && <p className="text-gray-500 text-lg">Loading story...</p>}
                        {error && <p className="text-red-600 font-bold mb-4 bg-red-100 p-3 rounded-lg border border-red-200">{error}</p>}
                        {!isLoading && story.length === 0 && !error && (
                            <p className="text-gray-500 text-xl italic bg-gray-50 p-6 rounded-lg">
                                Be the first to start the story!
                            </p>
                        )}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 min-h-48 flex flex-wrap justify-center items-center gap-3 text-3xl leading-relaxed text-gray-800 font-serif shadow-inner">
                            {story.map((word, index) => (
                                <span
                                    key={index}
                                    className="inline-block px-4 py-2 bg-blue-200 text-blue-800 rounded-full font-semibold shadow-md transform hover:scale-105 transition-transform duration-200 cursor-default"
                                >
                                    {word}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Contribute Section */}
                    {currentAccount && contract && (
                        <section className="mt-12 pt-8 border-t-2 border-gray-200">
                            <h2 className="text-4xl font-bold text-gray-800 mb-6">Add Your Word</h2>
                            <div className="flex flex-col items-center gap-4">
                                <input
                                    type="text"
                                    value={newWord}
                                    onChange={(e) => setNewWord(e.target.value)}
                                    placeholder="Type your word here (e.g., 'adventure')"
                                    className="w-full max-w-md p-4 border-2 border-gray-300 rounded-xl text-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all duration-300 shadow-sm"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleAddWord}
                                    disabled={isLoading || !newWord.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-300"
                                >
                                    {isLoading ? 'Adding Word...' : 'Contribute Word'}
                                </button>
                                <p className="text-base text-gray-600 mt-4 italic">
                                    Only one word per contribution! No spaces allowed.
                                </p>
                            </div>
                        </section>
                    )}
                </main>

                {/* Footer Section */}
                <footer className="mt-16 pt-8 border-t-2 border-gray-100 text-lg text-gray-500">
                    <p>Built with ❤️ by the community using Solidity, Foundry, React, Vite & Tailwind CSS.</p>
                </footer>
            </div>
        </div>
    );
}