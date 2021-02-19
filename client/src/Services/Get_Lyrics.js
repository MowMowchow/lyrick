const Genius = require('genius-lyrics');

const fetch = require('node-fetch');
const apiKey = 'NXYOIEcJWwoLl8Kd7zic9VcWVWyVoCSkVST0PypcOPrQL3F6CzIwsduTPIDGr_gv'
const Client = new Genius.Client(apiKey); // Scrapes if no key is provided
let english = /^[A-Za-z0-9]*$/;
let non_letters = /[,.()&-'`\s{2,}]/
let bad = ['featuring', 'feat', 'ft', 'with', 'and'];


async function Get_Lyrics(){
	var curr_song = await fetch('http://localhost:3001/np')
	.then(res => res.json())
	.then(async spotify_data => {
		let query = `${spotify_data.title} ${spotify_data.artists[0]}`;
		query = query.replace('[','(');
		query = query.replace(']',')');

		query = query.replace(/[,.&-'`]/g, "");

		const searches = await Client.songs.search(query);
		query = query.replace(/[,.()&-'`]/g, "");
		query = query.replace(/\s{2,}/g, ' ');
		query = query.toLowerCase();
		query = query.split(" ");
		query = query.filter(word => !bad.includes(word));

		let i = 0

		while (i < searches.length){
			let song = searches[i].fullTitle.toLowerCase()
			let found = true;
			query.forEach(item => {
				if (!song.includes(item)){
					found = false;
				}
			})
			for (let letter of song){
				if (!english.test(letter) && !non_letters.test(letter)){
					found = false;
				}
			}
			if ((!query.includes("remix") && song.includes("remix")) || (query.includes("remix") && !song.includes("remix"))){
				found = false
			}

			if (found){
				break;
			}
			i++;
		}
		
		const Song = searches[i];
		if (Song){
			let lyrics = null;
			lyrics = await Song.lyrics();
			return lyrics
		} else {
			return -1;
		}
	})
	return curr_song;
}
export default Get_Lyrics;