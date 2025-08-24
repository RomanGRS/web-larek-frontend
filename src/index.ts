import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { ShopApi } from './components/ShopAPI';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppData, Product } from './components/AppData';
import { Page } from './components/Page';
import { Card, CardBasket, CardPreview } from './components/Card';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order, Сontacts } from './components/Order';
import { IOrderForm } from './types';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new ShopApi(CDN_URL, API_URL);

events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Шаблоны
const successTempl = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTempl = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTempl = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTempl = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTempl = ensureElement<HTMLTemplateElement>('#basket');
const orderTempl = ensureElement<HTMLTemplateElement>('#order');
const contactsTempl = ensureElement<HTMLTemplateElement>('#contacts');

// Модель состояния приложения
const appData = new AppData({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(
	cloneTemplate<HTMLTemplateElement>(basketTempl),
	events
);
const order = new Order(cloneTemplate<HTMLFormElement>(orderTempl), events);
const contacts = new Сontacts(
	cloneTemplate<HTMLFormElement>(contactsTempl),
	events
);

// Бизнес-логика

// Получены данные карточек c сервера
events.on('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTempl), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			category: item.category,
			image: api.cdn + item.image,
			price: item.price,
		});
	});
});

// Выбираем карточку
events.on('card:select', (item: Product) => {
	appData.setPreview(item); // регистрирует событие preview:changed
});

// Получаем данные для превью - отображаем данные превью
events.on('preview:changed', (item: Product) => {
	const card = new CardPreview(cloneTemplate(cardPreviewTempl), {
		onClick: () => events.emit('card:add', item),
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: api.cdn + item.image,
			text: item.description,
			price: item.price,
			category: item.category,
		}),
	});
});

// Добавляем товар в корзину:
// - сохранить эти данные в заказ и корзине
// - инкрементировать счетчик
events.on('card:add', (item: Product) => {
	appData.addToOrder(item);
	appData.setProductToBasket(item);
	page.counter = appData.bskt.length;
	modal.close();
});

// Открываем корзину:
// - отображаем кнопку в нужном режиме
// - отображаем сумму товаров в корзине
// - отображаем данные товаров в корзине
// - вставляем получившийся контент в модальное окно
events.on('basket:open', () => {
	basket.setDisabled(basket.button, appData.statusBasket);
	basket.total = appData.getTotal();
	let i = 1;
	basket.items = appData.bskt.map((item) => {
		const card = new CardBasket(cloneTemplate(cardBasketTempl), {
			onClick: () => events.emit('card:remove', item),
		});
		return card.render({
			title: item.title,
			price: item.price,
			index: i++,
		});
	});
	modal.render({
		content: basket.render(),
	});
});

// Удаляем товар из корзины
// - удалить данные товара из списка корзины
// - удалить данные товара из списка заказа
// - обновить счетчик корзины
// - обновить статус кнопки
// - обновить статус суммы товаров
// - переотобразить товары в корзине
// - вставить контент в модалку
events.on('card:remove', (item: Product) => {
	appData.removeProductToBasket(item);
	appData.removeFromOrder(item);
	page.counter = appData.bskt.length;
	basket.setDisabled(basket.button, appData.statusBasket);
	basket.total = appData.getTotal();
	let i = 1;
	basket.items = appData.bskt.map((item) => {
		const card = new CardBasket(cloneTemplate(cardBasketTempl), {
			onClick: () => events.emit('card:remove', item),
		});
		return card.render({
			title: item.title,
			price: item.price,
			index: i++,
		});
	});
	modal.render({
		content: basket.render(),
	});
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone, address, payment } = errors;
	order.valid = !address && !payment;
	contacts.valid = !email && !phone;
	order.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей контактов - сохраняем данные об этом
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

// Изменилось одно из полей заказа - сохраняем данные об этом
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Выбираем способ оплаты - фиксируем данные об этом
events.on('payment:change', (item: HTMLButtonElement) => {
	appData.order.payment = item.name;
});

// Открываем окно заказа - рендерим модальное окно с контентом заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			payment: 'card',
			valid: false,
			errors: [],
		}),
	});
});

// Отправляем форму заказа:
// - передать данные суммы заказа
// - отрендерить следующих шаг
events.on('order:submit', () => {
	appData.order.total = appData.getTotal();
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('success:close', () => modal.close());
// Открываем окно контактов - рендерим модальное окно с контентом контактов
// - передать серверу данные заказа
// - отрендерить модалку с успешной отправкой
events.on('contacts:submit', () => {
	api
		.orderProducts(appData.order)
		.then((data) => {
			console.log(appData.order);
			const success = new Success(cloneTemplate(successTempl), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					page.counter = appData.bskt.length;
				},
			});

			modal.render({
				content: success.render({
					total: appData.getTotal(),
				}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// Разблокируем прокрутку страницы если открыта модалка
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем лоты с сервера
api
	.getProductList()
	.then((data) => {
		console.log('Полученные данные:', data);
		appData.setCatalog(data);
	})
	.catch((err) => {
		console.error('Ошибка при получении данных:', err);
	});
