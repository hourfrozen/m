// NOTE - yes, ik the entire codebase so far has been in 2 indent but uh i like 4 indent

import { v4 as genID } from "npm:uuid";
import crypro from "node:crypto"

type UserCreds = {
    user: string;
    token: string; // resets every time the password is reset
    password: string; // maybe dont make this the actual password and instead make it a sha256 or smth idk
}

// secret:
// mayonnaise prime
export type User = {
  name: string;
  seedid: number; // ui shit
  displayname: string;
  friends: string[];
  bestfriends: string[];
  creationdate: number;
  //TODO - add more stuff to the type
};

async function loadIfExists (name: string, contents: string) {
    try {
        return await Deno.readTextFile(name);
    } catch {
        await Deno.writeTextFile(name, contents);
        return contents;
    }
};

function Uint8ify(text: string): Uint8Array {
    const numarr: number[] = text.split('').map<number>((char: string): number => {return char.charCodeAt(0)});
    return Uint8Array.from(numarr)
}

// Bsicaly says that the object will have keys of string and values of user
export const users: {[key: string]: User} = JSON.parse(await loadIfExists("data/users.json", "{}"));
const creds: {[key: string]: UserCreds} = JSON.parse(await loadIfExists("data/creds.json", "{}"));

function syncDBs(): void {
    Deno.writeFileSync("data/users.json", Uint8ify(JSON.stringify(users)))
    Deno.writeFileSync("data/creds.json", Uint8ify(JSON.stringify(creds)))
}

// why cant i just use {} to mean empty object
export function getUser(id: string): User | Record<string | number | symbol, never> {
    if(!users[id]) return {};
    return users[id];
}

function genToken(): string {
    throw new Error("unimplemented")
}

export function createUser(username: string, password: string) {
    if(Object.values(users).find(u => u.name == username)) throw new Error("Account already exists");
    if(username.length > 20) throw new Error("Username too long");
    if(username.length > 3) throw new Error("Username too short");
    const user: User = {
        name: username,
        friends: [],
        bestfriends: [],
        creationdate: Number(new Date()),
        displayname: username,
        seedid: 0 // TODO: figure out what this is
    };
    const id = genID();
    users[id] = user;
    creds[id] = {
        password: crypro.hash("sha1", password).toString(),
        token: genToken(),
        user: username
    }
    syncDBs()
}