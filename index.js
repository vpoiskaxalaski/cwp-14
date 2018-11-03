const Sequelize = require('sequelize');
const config = require('./config.json');
const db = require('./models')(Sequelize, config);
let films = require('./films.json');
const actors = require('./actors.json');

(async () => {
	await db.sequelize.sync({force: true});

	console.log('1. Валидация полей budget, year и rating фильма');
	try
	{
		await db.films.create({
			title: 'Побег из Шоушенка | The Shawshank Redemption',
			rating: 9.191,
			year: 1894,
			budget: 25000000,
			gross: 59000000,
			poster: 'https://st.kp.yandex.net/images/film_iphone/iphone360_46019.jpg',
			position: 100
		});
	}
	catch (e)
	{
		e.errors.forEach((err) => {
			console.log(`\t >> Exception: ${err.message} <<`);
		});
	}

	console.log('2. Пакетная вставка 3 фильмов');
	await db.films.bulkCreate(films.slice(0,3));

	console.log('3. Пакетное обновление поля liked у актеров с 3 фильмами');
	await db.actors.update({
			liked: 999
		},
		{
			where:{
				films: 3
			}
		});

	console.log('4. Пакетное удаление актеров с liked равным 0');
	await db.actors.destroy({
		where: {
			liked: 0
		}
	});

	console.log('5. Получение за один запрос фильм со всеми его актерами (include)');
	(await db.films.findByPk(2, {
		include: [{
			model: db.actors,
			as: 'Actors'
		}]
	})).Actors.forEach((e) => {
		console.log(`>> ${e.name}`);
	});

	console.log('6. Создание и применение scope для фильмов вышедших с 2007 года');
	(await db.films.scope('new')
		.findAll()).forEach((film) => {
		console.log(`>> ${film.title}`);
	});

	//вьюшка(объявление в модели  films)
	console.log('7. Создание и вызов хуков beforeCreate, afterCreate');
	db.sequelize.addHook('beforeBulkCreate', () => {
		console.log('beforeBulkCreate');
	});

	//hook - метод(триггер)
	db.sequelize.addHook('afterBulkCreate', () => {
		console.log('afterBulkCreate');
	});

	await db.actors.bulkCreate(actors.slice(1,4));

	await db.actorsAndFilms.bulkCreate([
		{actorId: 2, filmId: 2}
	]);

	console.log('8. Транзакция: считываем всех актеров, пакетно обновляем им liked на 0, ждем 10 секунд, откатываем транзакцию');
	await db.sequelize.transaction().then((_t) => {
		return db.actors.update({
				liked: 0
			},
			{
				where: {}
			}).then(() => {
			console.log('sleep(10000)');
			setTimeout(function () {
				console.log("rollback");
				return _t.rollback();     // _t.commit();
			}, 10000);
		});
	});

	console.log('End');

})();