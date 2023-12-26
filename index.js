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
    res.render('index.ejs', await fetchAndFormResponseObject())
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
        console.log('in here')
        res.redirect('/');
      } catch (error) {
        console.log(error)
        let noDuplicateError = 'Country already entered. Please enter a unique country'
        console.log(noDuplicateError, '-----from line 44')
        res.render('index.ejs', await fetchAndFormResponseObject(noDuplicateError))
      }
    }
   
  } catch (error) {
    let notExistError = 'Country does not exist. Please try again.'
    // console.log(notExistError, '-----from line 34');
    res.render('index.ejs', await fetchAndFormResponseObject(notExistError))
  }
  
  
})

async function fetchAndFormResponseObject(err = null) {
  const result = await getColumn('country_iso', 'countries_visited');
  try {
    const resp = {
      countries: result.rows.map(country => country.country_iso),
      total: result.rows.length
    }

    // console.log(resp, '----from line 60');
    return resp

  } catch (error) {
    console.log(error, '-----from line 64')
  }
}


async function searchISO(country) {
  try {
    const result = await db.query(`select country_code from countries where country_name='${country}'`);

    return result.rows[0].country_code
  } catch (error) {
    // console.log(error, '------from line 74')
    throw new Error('no such country exist')
  }
}

async function insertISO(iso) {
  try {
    let r = await db.query(`insert into countries_visited (country_iso) values ($1)`, [iso])
    console.log(r)
  } catch (error) {
    console.log(error, '-------from line 82');
    return error.detail
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
  console.log(`------Server running on http://localhost:${port}`);
});
