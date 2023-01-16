import {useState} from 'react'
import {ethers} from "ethers"
import {Button, Form, Row} from 'react-bootstrap'
import {create as ipfsHttpClient} from 'ipfs-http-client'

const projectId = process.env.REACT_APP_PROJECT_ID;
const APISecret = process.env.REACT_APP_APPSECRET;
const identifier = projectId+":"+APISecret
const Auth = 'Basic '+btoa(identifier)

const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: Auth
    }
})

const Create = ({ marketplace, nft }) => {
    console.log(process.env)
    console.log(identifier)
    console.log("Auth generated: "+ Auth)


    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const uploadToIPFS = async (event) => {
        console.log("Uploading to IPFS")
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log(result)
                setImage(`https://inno-nft.infura-ipfs.io/ipfs/${result.path}`)
            } catch (error){
                console.log("ipfs image upload error: ", error)
            }
        }
    }
    const createNFT = async () => {
        console.log("Creating NFT")
        // if (!image || !price || !name || !description) return
        try{
            const result = await client.add(JSON.stringify({image, price, name, description}))
            console.log(result)
            mintThenList(result)
        } catch(error) {
            console.log("ipfs uri upload error: ", error)
        }
    }
    const mintThenList = async (result) => {
        const uri = `https://inno-nft.infura-ipfs.io/ipfs/${result.path}`
        console.log("Item URI: ", uri)

        // mint nft
        await(await nft.mint(uri)).wait()
        // get tokenId of new nft
        const id = await nft.tokenCount()

        console.log("Current ID: ", id)
        // approve marketplace to spend nft
        await(await nft.setApprovalForAll(marketplace.address, true)).wait()
        console.log("Approved")
        // add nft to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        console.log("Listing PRice: ", listingPrice)
        await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
        console.log("Added to the marketplace")
    }
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS}
                            />
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
                            <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
                            <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                            <div className="d-grid px-0">
                                <Button onClick={createNFT} variant="primary" size="lg">
                                    Create & List NFT!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Create
