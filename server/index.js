const app = require('express')();
const http = require('http').createServer(app);
const mysql = require('mysql');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'progress'
});

const cors = (req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
	res.header('Access-Control-Allow-Credentials', true)
	res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
	next();
};

app.use(cors);

const model_datasets = (x) => {
	const { Workout, Weight, Data } = x;
	return Object.fromEntries(
		Object.entries({
			Workout,
			Weight,
			Data,
			'X Axis': x['X Axis'],
			'Y Axis': x['Y Axis'],
		})
		.map(([k, v]) => 
			[`\`${k}\``, con.escape(v)]
		)
	)
	
}

// connect to database
con.connect((err) => {
	if(err) throw err;

	app.get('/GetDatasets', (req, res) => {
		con.query(`SELECT * FROM datasets`, (err, result) => {
			if (err) throw err;
			
			res.send(result.map((x) => {
				return {
					...x,
					Data: JSON.parse(x.Data),
				}
			}));
			
		});
	});

	app.post('/PostUpdateDataset', jsonParser, (req, res) => {
		// Data with unneccessary values removed
		const model = model_datasets(req.body);

		// Query string
		const query = `
			UPDATE datasets 
			SET ${ Object.entries(model).map((x) => x.join(' = ')) }
			WHERE id = ${con.escape(req.body.id)}
		`;
		
		// Update the database
		con.query(query, (err, result) => {
			if (err) throw err;
			res.sendStatus(200);
		});
		
	});

	app.post('/PostCreateDataset', jsonParser, (req, res) => {
		const model = {
			...model_datasets(req.body),
			Created: (new Date()).getTime()
		}

		// Query string
		const query = `
			INSERT INTO datasets (${Object.keys(model)})
			VALUES (${Object.values(model)})
		`;

		// Update the database
		con.query(query, (err, result) => {
			if (err) throw err;
			res.sendStatus(200);
		});

	});

	app.post('/PostDeleteDataset', jsonParser, (req, res) => {

		// Query string
		const query = `
			DELETE FROM datasets
			WHERE id = ${req.body.id}
		`;

		// Update the database
		con.query(query, (err, result) => {
			if (err) throw err;
			res.sendStatus(200);
		});

	});

    http.listen(8081, () => {
        console.log('Listening');
    })
});

