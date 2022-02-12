let blockfrostOpts = {
	  method: 'GET',      
	  headers: {
	  	project_id: 'mainnetffL7w6r3aVtwn4CajbmoyY7tSTMGOsWJ'
	  }
	};

let blockfrostUrl = 'https://cardano-mainnet.blockfrost.io/api/v0';

let atcnftPolicyId = 'fe23eed404f37462181a236a400a13243c1a0a97c78648e85d0819ed';

const getAddress = (text) => {
	hidePreview();
	showText("","Loading...","");

	if(!text) {
		showText("","Input is required!","");
		return;
	}

	let address = fetchAtTypeAddress(text) || fetchHashTypeAddress(text);

	if(address === false) {
		showText("","Input is invalid!","");
	}
}


const fetchAtTypeAddress = (text, nocheck) => {
	if(!nocheck && !isAtType(text))
		return false;

	let chunks = text.split("@");

	let policyAlias = chunks[chunks.length-1];

	let assetAlias = text.slice(0, text.lastIndexOf("@"));

	if(isEmpty(policyAlias) || isEmpty(assetAlias))
		return false;

	blackfrostGetAddress(policyAlias, assetAlias);

	return true;
}

const fetchHashTypeAddress = (text, nocheck) => {
	if(!nocheck && !isHashType(text))
		return false;

	let chunks = text.split("#");

	let policyAlias = chunks[0];

	let assetAlias = text.slice(text.indexOf("#")+1, text.length);

	if(isEmpty(policyAlias) || isEmpty(assetAlias))
		return false;

	blackfrostGetAddress(policyAlias, assetAlias);

	return true;
}

const isAtCnft = (text) => {
	return isAtType(text) || isHashType(text);
}

const isAtType = (text) => {
	return !isEmpty(text) && text.indexOf("@") !== -1;
}

const isHashType = (text) => {
	return !isEmpty(text) && text.indexOf("#") !== -1;
}

const isEmpty = (text) => {
	return (!text) || text.length === 0 || text === "";
}

const string2Hex = (text) => {
    var str = '';
    for(var i = 0; i < text.length; i++) {
        str += text[i].charCodeAt(0).toString(16);
    }
    return str;
}

const blackfrostGetAddress = (policyAlias, assetAlias) => {
	// Get cnft record from blockfrost
	let atcnftAssetId = atcnftPolicyId + string2Hex(policyAlias); // TODO: Convert to utf8

	blockfrostGet(blockfrostUrl + "/assets/" + atcnftAssetId, handleGetCnftAssetInfoResponse, assetAlias);
}

const blockfrostGet = (url, handler, context) => {
	fetch(url, blockfrostOpts).then(function (response) {
	  return response.json();
	})
	.then(function (body) {
		handler(body, context);
	});
}

const handleGetCnftAssetInfoResponse = (body, assetAlias) => {
	if(!body || body.error) { // TODO: Handle various error codes
		showText("", "The specified collection is not registered!", "");
		return;
	}

	let assetName = body.onchain_metadata.prepend +  assetAlias + body.onchain_metadata.append;

	let assetId = body.onchain_metadata.referenceId + string2Hex(assetName); // TODO: Convert to utf8

	blockfrostGet(blockfrostUrl + "/assets/" + assetId + "/addresses",
		handleGetAssetAddressResponse, assetId);
}

const handleGetAssetAddressResponse = (body, assetId) => {
	if(!body || body.error) {
		showText("", "The specified NFT was not found!", "");
		return;
	}

	let address = body[0].address;

	showText(address.substring(0, 10), 
		"...",
		address.substring(address.length - 10, address.length));

	blockfrostGet(blockfrostUrl + "/assets/" + assetId, handleGetAssetInfo);
}

const handleGetAssetInfo = (body) => {
	if(!body || body.error) {
		return;
	}

	let imgSrc = body.onchain_metadata.image;
	
	if(imgSrc.startsWith("ipfs://ipfs/"))
		imgSrc = imgSrc.replace("ipfs://ipfs/", "https://ipfs.io/ipfs/");
	else if(imgSrc.startsWith("ipfs://"))
		imgSrc = imgSrc.replace("ipfs://", "https://ipfs.io/ipfs/");

	document.getElementById("nftPreview").src = imgSrc;
	showPreview();
}

const showText = (left, mid, right) => {
	document.getElementById("pAddress").style.display = "block";
	document.getElementById('spanAddressLeft').textContent = left;
	document.getElementById('spanAddressMiddle').textContent = mid;
	document.getElementById('spanAddressRight').textContent = right;
}

const showPreview = () => {
	document.getElementById("nftPreview").style.display = "block";
}

const hidePreview = () => {
	document.getElementById("nftPreview").style.display = "none";
}

const checkParams = () => {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());

	console.log(params);
}

checkParams();