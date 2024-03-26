import {initializeKeypair} from '@solana-developers/helpers'
import {Cluster, Connection, clusterApiUrl} from '@solana/web3.js'
import {createAndMintToken} from './create-and-mint-token'
import {TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID} from '@solana/spl-token'
import {
	TokenInfoForDisplay,
	fetchTokenInfo,
	fetchTokenProgramFromAccount,
} from './fetch-token-info'
import printTableData from './print-helpers'
import dotenv from 'dotenv'
dotenv.config()

const CLUSTER: Cluster = 'devnet'

async function main() {
	/**
	 * Create a connection and initialize a keypair if one doesn't already exists.
	 * If a keypair exists, airdrop a sol if needed.
	 */
	const connection = new Connection(clusterApiUrl(CLUSTER))
	const payer = await initializeKeypair(connection)

	console.log(`Payer: ${payer.publicKey.toBase58()}`)

	const tokenProgramMint = await createAndMintToken(
		connection,
		TOKEN_PROGRAM_ID,
		payer,
		0,
		1000
	)
	const tokenExtensionProgramMint = await createAndMintToken(
		connection,
		TOKEN_2022_PROGRAM_ID,
		payer,
		0,
		1000
	)

	const myTokens: TokenInfoForDisplay[] = []

	myTokens.push(
		...(await fetchTokenInfo(
			connection,
			payer.publicKey,
			TOKEN_PROGRAM_ID,
			'Token Program'
		)),
		...(await fetchTokenInfo(
			connection,
			payer.publicKey,
			TOKEN_2022_PROGRAM_ID,
			'Token Extension Program'
		))
	)

	printTableData(myTokens)

	const tokenProgramTokenProgram = await fetchTokenProgramFromAccount(
		connection,
		tokenProgramMint
	)
	const tokenExtensionProgramTokenProgram =
		await fetchTokenProgramFromAccount(
			connection,
			tokenExtensionProgramMint
		)

	if (!tokenProgramTokenProgram.equals(TOKEN_PROGRAM_ID))
		throw new Error('Legacy mint token program is not correct')
	if (!tokenExtensionProgramTokenProgram.equals(TOKEN_2022_PROGRAM_ID))
		throw new Error(
			'Token Extension Program mint token program is not correct'
		)
}

main()
