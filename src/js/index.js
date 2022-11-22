import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Api } from './api';
import creatCards from '../templates/card.hbs';

const searchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const Pixabay = new Api();

const lightbox = new SimpleLightbox('.gallery div', {
  sourceAttr: 'data-url',
  captionsData: 'alt',
  captionDelay: 250,
});
const onSearchFormSubmit = async event => {
  event.preventDefault();

  Pixabay.query = event.currentTarget.elements.searchQuery.value;
  Pixabay.page = 1;

  try {
    const response = await Pixabay.fetchPhotosByQuery();

    if (response.data.total === 0) {
      event.target.elements.searchQuery.value = ' ';
      loadMoreBtn.classList.add('is-hidden');
      galleryEl.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );

      return;
    }
    Pixabay.totalHits = response.data.totalHits;

    if (response.data.totalHits <= Pixabay.per_page) {
      loadMoreBtn.classList.add('is-hidden');
    } else {
      loadMoreBtn.classList.remove('is-hidden');
    }
    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );
    galleryEl.innerHTML = creatCards(response.data.hits);
    lightbox.refresh();
  } catch (error) {
    Notiflix.Notify.failure(console.log(error));
  }
};
const onLoadMoreBtnClick = async event => {
  if (!Pixabay.isNextDataExist()) {
    loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.failure(
      "Were sorry, but you've reached the end of search results."
    );
    return;
  }
  Pixabay.page += 1;

  try {
    const response = await Pixabay.fetchPhotosByQuery();
    Pixabay.totalHits = response.data.totalHits;

    galleryEl.insertAdjacentHTML('beforeend', creatCards(response.data.hits));
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }

  //   плавне прокручування
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

searchFormEl.addEventListener('submit', onSearchFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
