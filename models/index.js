const Actor = require('./actor');
const Film = require('./film');
const ActorsAndFilms = require('./actorsAndFilms');

module.exports = (Sequelize, config) => {
	const sequelize = new Sequelize(config.db, config.login, config.password, {
		host: config.host,
		dialect: config.dialect,
		logging: false
	});

	const films = Film(Sequelize, sequelize);
	const actors = Actor(Sequelize, sequelize);
	const actorsAndFilms = ActorsAndFilms(Sequelize, sequelize);

	actors.belongsToMany(films, {as: 'Films', through: 'ActorFilms'});
	films.belongsToMany(actors, {as: 'Actors', through: 'ActorFilms'});

	return {
		films,
		actors,
		actorsAndFilms,

		sequelize: sequelize,
		Sequelize: Sequelize,
	};
};