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
    const resp = await fetchAndFormResponseObject();
    console.log(resp)
    res.render('index.ejs', resp)
  } catch (error) {
    console.log(error)
  }
});

app.post('/add', async (req, res) => {
  try {
    let result = await searchISO(req.body.country)
    if (result) {
      try {
        await insertISO(result);
        res.redirect('/');
      } catch (error) {
        let noDuplicateError = 'Country already entered. Please enter a unique country'
        console.log(noDuplicateError, '-----from line 44')
        res.render('index.ejs', await fetchAndFormResponseObject(noDuplicateError))
      }
    }
   
  } catch (error) {
    console.error(error)
    let notExistError = 'Country does not exist. Please try again.'
    res.render('index.ejs', await fetchAndFormResponseObject(notExistError))
  }
})

async function fetchAndFormResponseObject(error=null){
  try {
    const resp = await db.query(`SELECT * FROM public.countries_visited`);
    return {
      countries: resp.rows.map(country => country.country_iso),
      total: resp.rows.length,
      error: error
    }
  } catch (error) {

  }
}


async function searchISO(country) {
  try {
    const result = await db.query(`select country_code from countries where LOWER(country_name) like '%' || $1 || '%'`, [country.toLowerCase()]);

    return result.rows[0].country_code
  } catch (error) {
    throw 'Does not exist'
  }
}

async function insertISO(iso) {
  try {
    let r = await db.query(`insert into countries_visited (country_iso) values ($1)`, [iso])
    return iso
  } catch (error) {
    throw 'Duplicate found'
  }
}


app.listen(port, () => {
  console.log(`------Server running on http://localhost:${port}`);
});
