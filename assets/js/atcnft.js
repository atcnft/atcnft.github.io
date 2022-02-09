const getAddress = (text) => {
	display("","Loading...","");

	if(!text) {
		display("","Input is required!","");
		return;
	}

	let address = fetchAtTypeAddress(text) || fetchHashTypeAddress(text);

	if(address === false) {
		display("","Input is invalid!","");
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
	let blockfrostUrl = 'https://cardano-testnet.blockfrost.io/api/v0';

	let atcnftPolicyId = '047d8a71dd928fdc2720fb0883be79b328785f6b0b2e3f830c8e10e6';

	let atcnftAssetId = atcnftPolicyId + string2Hex(policyAlias); // TODO: Convert to utf8

	var opts = {
	  method: 'GET',      
	  headers: {
	  	project_id: 'testnet7FHA3YpffrzpTXy9Y5G2crnSF888u0VE'
	  }
	};

	fetch(blockfrostUrl + "/assets/" + atcnftAssetId, opts).then(function (response) {
	  return response.json();
	})
	.then(function (body) {
		if(!body || body.error) {
			document.getElementById('spanAddressMiddle').textContent = "The specified collection is not registered!";
			return;
		}

		let assetName = body.onchain_metadata.prepend + assetAlias + body.onchain_metadata.append;

		let assetId = body.onchain_metadata.referenceId + string2Hex(assetName); // TODO: Convert to utf8

		fetch(blockfrostUrl + "/assets/" + assetId + "/addresses", opts).then(function (response) {
		  return response.json();
		})
		.then(function (body) {
			if(!body || body.error) {
				document.getElementById('spanAddressMiddle').textContent = "The specified NFT was not found!";
				return;
			}

			let address = body[0].address;

			display(address.substring(0, 10), 
				"...",
				address.substring(address.length - 10, address.length));
		});
	});
}

const display = (left, mid, right) => {
	document.getElementById("pAddress").style.display = "block";
	document.getElementById('spanAddressLeft').textContent = left;
	document.getElementById('spanAddressMiddle').textContent = mid;
	document.getElementById('spanAddressRight').textContent = right;
}