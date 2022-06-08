const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectIntoResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDbDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    director_name: dbObject.director_name,
  };
};

//Get API1

app.get("/movies/", async (request, response) => {
  const getMoviesArray = `SELECT * FROM movie;`;
  const moviesArray = await db.all(getMoviesArray);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//Post API2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMoviesArray = `INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES ('${directorId}','${movieName}','${leadActor}');`;
  const moviesArray = await db.run(postMoviesArray);
  response.send("Movie Successfully Added");
});

//Get API3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieArray = `SELECT * FROM movie 
        WHERE 
            movie_id = '${movieId}';`;
  const movieArray = await db.get(getMovieArray);
  response.send(convertDbObjectIntoResponseObject(movieArray));
});

//Put API4

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieArray = `UPDATE movie SET director_id='${directorId}',movie_name='${movieName}',lead_actor='${leadActor}'
    WHERE movie_id = '${movieId}';`;
  await db.run(updateMovieArray);
  response.send("Movie Details Updated");
});

//Delete API5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieArray = `DELETE FROM movie WHERE movie_id ='${movieId}';`;
  await db.run(deleteMovieArray);
  response.send("Movie Removed");
});

//Get API6

app.get("/directors/", async (request, response) => {
  const getDirectorList = `SELECT * FROM director;`;
  const directorsList = await db.all(getDirectorList);
  response.send(
    directorsList.map((eachDirector) =>
      convertDbDirectorObjectToResponseObject(eachDirector)
    )
  );
});

//Get API7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirectorsList = `SELECT movie_name FROM movie WHERE director_id='${directorId}';`;
  const movieDirectorsList = await db.all(getMovieDirectorsList);
  response.send(
    movieDirectorsList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
