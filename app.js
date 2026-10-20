// Loads rekordstore_db_tables.sql into an in-browser SQLite database
// and renders the record list (#/) and each album's page (#/album/<code>).

const app = document.getElementById('app');
const LABELS = ['#d0311f', '#d9ee50', '#cdc3f1', '#3d2f94', '#f2a541'];
let db;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
	{ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// Runs a query and returns its rows as plain objects
const query = (sql, params = []) => {
	const stmt = db.prepare(sql);
	stmt.bind(params);
	const rows = [];
	while (stmt.step()) rows.push(stmt.getAsObject());
	stmt.free();
	return rows;
};

const disc = (code) => {
	const color = LABELS[Math.floor(code / 111 - 1) % LABELS.length] || LABELS[0];
	return `<span class="disc" style="--label:${color}" aria-hidden="true"></span>`;
};

const formatDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
	month: 'short', day: 'numeric', year: 'numeric',
});

const sqlBlock = (sql) => `
	<details class="sql">
		<summary>Show the SQL</summary>
		<pre><code>${esc(sql.trim().replace(/^\t+/gm, ''))}</code></pre>
	</details>`;

const LIST_SQL = `
	SELECT Album.albumCode, albumTitle, artist, yearOfRelease, COUNT(copyCode) AS copies
	FROM Album LEFT JOIN Album_Copy ON Album.albumCode = Album_Copy.albumCode
	GROUP BY Album.albumCode
	ORDER BY Album.albumCode;`;

const ALBUM_SQL = `
	SELECT albumTitle, artist, yearOfRelease
	FROM Album
	WHERE albumCode = ?;`;

const COPIES_SQL = `
	SELECT copyCode, purchaseDate, conditions
	FROM Album_Copy
	WHERE albumCode = ?
	ORDER BY purchaseDate;`;

const renderList = () => {
	const albums = query(LIST_SQL);
	document.title = 'Rekord Store - Hannah Capone';
	app.innerHTML = `
		<h1>My Favorite Records</h1>
		<p class="lede"><i>Click the titles to learn more</i></p>
		<ol class="records">
			${albums.map((a) => `
				<li>
					<a class="record" href="#/album/${a.albumCode}">
						${disc(a.albumCode)}
						<span class="title">${esc(a.albumTitle)}</span>
						<span class="artist">${esc(a.artist)}</span>
						<span class="year">${esc(a.yearOfRelease)}</span>
						<span class="copies">${a.copies} ${a.copies === 1 ? 'copy' : 'copies'}</span>
					</a>
				</li>`).join('')}
		</ol>
		${sqlBlock(LIST_SQL)}`;
};

const renderAlbum = (code) => {
	const [album] = query(ALBUM_SQL, [code]);
	if (!album) {
		app.innerHTML = `<h1>Not found</h1><p class="lede"><a href="#/">&larr; Back to the records</a></p>`;
		return;
	}
	const copies = query(COPIES_SQL, [code]);
	document.title = `${album.albumTitle} - Rekord Store`;
	app.innerHTML = `
		<a class="back" href="#/">&larr; All records</a>
		<div class="album">
			${disc(code)}
			<div>
				<h1>${esc(album.albumTitle)}</h1>
				<p class="album-meta"><b>${esc(album.artist)}</b> &middot; ${esc(album.yearOfRelease)}</p>
			</div>
		</div>
		<h2>Copies in my collection</h2>
		<div class="table-wrap">
			<table class="copies-table">
				<thead><tr><th>Copy code</th><th>Purchased</th><th>Condition</th></tr></thead>
				<tbody>
					${copies.map((c) => `
						<tr>
							<td>#${String(c.copyCode).padStart(4, '0')}</td>
							<td>${esc(formatDate(c.purchaseDate))}</td>
							<td><span class="condition condition-${esc(c.conditions.toLowerCase())}">${esc(c.conditions)}</span></td>
						</tr>`).join('')}
				</tbody>
			</table>
		</div>
		${sqlBlock(ALBUM_SQL + '\n\n' + COPIES_SQL)}`;
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
	app.innerHTML = '<p class="loading">The database didn\'t load. Try refreshing the page.</p>';
});
