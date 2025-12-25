import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addNewCard, deleteCardApi, changeLikeCardStatus} from "./components/api.js";
import { createCardElement, deleteCard, toggleLike } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation, disableSubmitButton, enableSubmitButton } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings); 

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileButtonSubmit = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardButtonSubmit = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarButtonSubmit = avatarForm.querySelector(".popup__button");

const cardInfoPopup = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoPopup.querySelector(".popup__title");
const cardInfoList = cardInfoPopup.querySelector(".popup__info");
const cardInfoText = cardInfoPopup.querySelector(".popup__text");
const cardInfoUsersList = cardInfoPopup.querySelector(".popup__list");

let userId;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileButtonSubmit.textContent = profileButtonSubmit.dataset.loadingText;
  disableSubmitButton(profileButtonSubmit, validationSettings);
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
  .then((userData) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    closeModalWindow(profileFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => { 
    profileButtonSubmit.textContent = profileButtonSubmit.dataset.defaultText
    enableSubmitButton(profileButtonSubmit, validationSettings);
  });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  avatarButtonSubmit.textContent = avatarButtonSubmit.dataset.loadingText;
  disableSubmitButton(avatarButtonSubmit, validationSettings);
  setUserAvatar({ avatar: avatarInput.value })
  .then((userData) => {
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    closeModalWindow(avatarFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => { 
    avatarButtonSubmit.textContent = avatarButtonSubmit.dataset.defaultText
    enableSubmitButton(avatarButtonSubmit, validationSettings);
  });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  cardButtonSubmit.textContent = cardButtonSubmit.dataset.loadingText;
  disableSubmitButton(cardButtonSubmit, validationSettings);
  addNewCard({ name: cardNameInput.value, link: cardLinkInput.value })
  .then((card) => {
    placesWrap.prepend(
      createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
          onInfoClick: handleInfoClick,
        }, userId
      )
    );
    closeModalWindow(cardFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => { 
    cardButtonSubmit.textContent = cardButtonSubmit.dataset.defaultText
    enableSubmitButton(cardButtonSubmit, validationSettings);
  });
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCardApi(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (card, likeButton, likeCountElement) => {
  let isLiked = card.likes.some(user => user._id === userId);
  changeLikeCardStatus(card._id, isLiked)
    .then((updatedCard) => {
      toggleLike(likeButton, !isLiked);
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const element = document
    .querySelector("#popup-info-definition-template").content
    .querySelector(".popup__info-item")
    .cloneNode(true);

  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;

  return element;
};

const createUserPreview = (user) => {
  const element = document
    .querySelector("#popup-info-user-preview-template").content
    .querySelector(".popup__list-item")
    .cloneNode(true);

  element.textContent = user.name;

  return element;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);

      cardInfoTitle.textContent = "Информация о карточке";
      cardInfoList.innerHTML = "";
      cardInfoUsersList.innerHTML = "";

      cardInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      cardInfoText.textContent = "Лайкнули:";

      cardData.likes.forEach(user => {
        cardInfoUsersList.append(createUserPreview(user));
      });

      openModalWindow(cardInfoPopup);
    })
    .catch(console.log);
};

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    userId = userData._id;
    cards.forEach((card) => {
      placesWrap.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
          onInfoClick: handleInfoClick,
        }, userId)
      );
    });

    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
  })
  .catch((err) => {
    console.log(err);
  });