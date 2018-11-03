module.exports = (Sequelize, sequelize) => {
	return sequelize.define('actorsAndFilms', {
		actorId: {
			type: Sequelize.INTEGER,
			allowNull: false
		},
		filmId: {
			type: Sequelize.INTEGER,
			allowNull: false
		}
	});
};