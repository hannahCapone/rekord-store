// Same two pages as the PHP version (php/index.php and php/followingpage.php),
// running rekordstore_db_tables.sql in the browser with sql.js.

const app = document.getElementById('app');
let db;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
	{ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const query = (sql, params = []) => {
	const stmt = db.prepare(sql);
	stmt.bind(params);
	const rows = [];
	while (stmt.step()) rows.push(stmt.getAsObject());
	stmt.free();
	return rows;
};

// index.php
const renderList = () => {
	const albums = query('SELECT * FROM Album ORDER BY albumCode');
	document.title = 'My Favorite Records';
	app.innerHTML = `
		<h1>My Favorite Records</h1>
		<p><i>Click the titles to learn more</i></p>
		<ul class="albums">
			${albums.map((a) => `
				<li><a href="#/album/${a.albumCode}">${esc(a.albumTitle)}</a> || ${esc(a.artist)} || ${esc(a.yearOfRelease)}</li>`).join('')}
		</ul>`;
};

// followingpage.php
const renderAlbum = (code) => {
	const [album] = query('SELECT albumTitle, artist, yearOfRelease FROM Album WHERE albumCode = ?', [code]);
	if (!album) {
		app.innerHTML = '<p><a href="#/">&larr; Back</a></p><h1>Album not found</h1>';
		return;
	}
	const copies = query('SELECT copyCode, purchaseDate, conditions FROM Album_Copy WHERE albumCode = ? ORDER BY copyCode', [code]);
	document.title = `${album.albumTitle} - My Favorite Records`;
	app.innerHTML = `
		<p><a href="#/">&larr; Back</a></p>
		<h1>Album Title: ${esc(album.albumTitle)}</h1>
		<hr />
		<p><b>Artist:</b> ${esc(album.artist)}</p>
		<p><b>Year Of Release:</b> ${esc(album.yearOfRelease)}</p>
		${copies.map((c) => `
			<hr />
			<p><b>Copy Code:</b> ${String(c.copyCode).padStart(4, '0')}</p>
			<p><b>Purchase Date:</b> ${esc(c.purchaseDate)}</p>
			<p><b>Condition:</b> ${esc(c.conditions)}</p>`).join('')}
		<hr />`;
};

const route = () => {
	const match = location.hash.match(/^#\/album\/(\d+)$/);
	if (match) renderAlbum(Number(match[1]));
	else renderList();
	window.scrollTo(0, 0);
};

Promise.all([
	initSqlJs({ locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` }),
	fetch('rekordstore_db_tables.sql').then((r) => r.text()),
]).then(([SQL, tables]) => {
	db = new SQL.Database();
	db.exec(tables);
	window.addEventListener('hashchange', route);
	route();
}).catch(() => {
	app.innerHTML = '<p>The database didn\'t load. Try refreshing the page.</p>';
});
