import { Program } from "@anchor-lang/core";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} from "@solana/web3.js";

import idl from "./week5_counter.json";

const RPC_URL = "https://api.devnet.solana.com";

const connection = new Connection(RPC_URL, "confirmed");

const payer = Keypair.fromSecretKey(
  Uint8Array.from(
    require("/home/roma/.config/solana/id.json")
  )
);

const programId = new PublicKey(
  "HXRCnmKqMXdA17g5SQd7kvM8aBqDJ7Ynv3mNnY1LAvoW"
);

const program = new Program(idl as any, {
  connection,
});

async function main() {
  console.log("=== Week 5 Counter Client ===");
  console.log("Network: Devnet");
  console.log("Wallet:", payer.publicKey.toBase58());
  console.log("Program:", programId.toBase58());

  const [counter] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    programId
  );

  console.log("Counter PDA:", counter.toBase58());

  console.log("\nInitializing counter...");

  const initializeIx = await program.methods
    .initialize()
    .accounts({
      payer: payer.publicKey,
      counter,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const initializeTx = new Transaction().add(initializeIx);

  const initializeSignature = await sendAndConfirmTransaction(
    connection,
    initializeTx,
    [payer]
  );

  console.log("Initialize TX:", initializeSignature);

  console.log("\nIncrementing counter...");

  const incrementIx = await program.methods
    .increment()
    .accounts({
      counter,
      authority: payer.publicKey,
    })
    .instruction();

  const incrementTx = new Transaction().add(incrementIx);

  const incrementSignature = await sendAndConfirmTransaction(
    connection,
    incrementTx,
    [payer]
  );

  console.log("Increment TX:", incrementSignature);

  const counterAccount = await program.account.counter.fetch(counter);

  console.log("\n=== Counter State ===");
  console.log("Count:", counterAccount.count.toString());
  console.log("Authority:", counterAccount.authority.toBase58());
}

main().catch((error) => {
  console.error("ERROR:", error);
  process.exit(1);
});
