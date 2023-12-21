import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: 'postgres',
  password: 'jesus',
  host: 'localhost',
  port: 5433,
  database: 'world'
});

db.connect()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const result = await getColumn('country_iso','countries_visited');

    const resp = {
      countries: result.rows.map(country => country.country_iso),
      total: result.rows.length
    }
    res.render('index.ejs', resp)

  } catch (error) {
    console.log(error)
  }

});

app.post('/add', async (req, res) => {
  try {
    const result = await searchISO(req.body.country)
    console.log(result.rows)
    await insertISO(result.rows[0].country_code);

    res.send();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
})

async function searchISO(country) {
  try {
    const result = await db.query(`select country_code from countries where country_name='${country}'`);
    return result
  } catch (error) {
    console.log('hi')
  }
}

async function insertISO(iso) {
  try {
    await db.query(`insert into countries_visited (country_iso) values ($1)`, [iso])
  } catch (error) {
    console.log('hi');
  }
}

async function get(table) {
  const result = await db.query(`SELECT * FROM ${table}`);
  return result;
}

async function getColumn(column, table) {
  const result = await db.query(`SELECT ${column} FROM ${table}`);
  return result;
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
