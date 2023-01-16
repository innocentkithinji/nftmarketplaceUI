import './App.css';
import Navigation from "./Navbar";
import {useState} from "react";
import {ethers} from "ethers";
import MarketplaceAbi from '../contractData/Marketplace.json'
import NFTAbi from '../contractData/NFT.json'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Spinner} from "react-bootstrap";
import Home from "./Home";
import Create from "./Create";
import MyListedItems from "./MyListings";
import MyPurchases from "./MyPurchases";

function App() {
    const [loading, setLoading] = useState(true)
    const [account, setAccount] = useState(null)
    const [nft, setNFT] = useState({})
    const [marketplace, setMarketplace] = useState({})

    const loadContracts = async (signer) => {
        const marketplace = new ethers.Contract(process.env.REACT_APP_NFT_MARKETPLACE_CONTRACT_ADDR, MarketplaceAbi.abi, signer)
        setMarketplace(marketplace)
        const nft = new ethers.Contract(process.env.REACT_APP_NFT_CONTRACT_ADDR, NFTAbi.abi, signer)
        setNFT(nft)
        setLoading(false)
    }

    const web3Handler = async () => {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        setAccount(accounts[0])
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()

        loadContracts(signer)
    };
    return (
        <BrowserRouter>
            <div className="App">
                <Navigation web3Handler={web3Handler} acc={account}/>
                {loading ? (
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
                        <Spinner animation="border" style={{display: 'flex'}}/>
                        <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={
                            <Home marketplace={marketplace} nft={nft}/>
                        }/>
                        <Route path="/create" element={
                            <Create marketplace={marketplace} nft={nft}/>
                        }/>
                        <Route path="/my-listed-items" element={
                            <MyListedItems marketplace={marketplace} nft={nft} account={account}/>
                        }/>
                        <Route path="/my-purchases" element={
                            <MyPurchases marketplace={marketplace} nft={nft} account={account}/>
                        }/>
                    </Routes>
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;
