'use strict';
const urlAll = `https://restcountries.com/v3.1/all`;
const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const searchInput = document.querySelector('#searshField');
const divSearchResult = document.getElementById('searchOut');
let searchOutUl = document.querySelector('.searchOutUl');
let allData = {};
console.log(allData);

btn.addEventListener('click', function () {
  const value = searchInput.value;
  if (value.length > 1) {
    sortResult(findResult(value));
    searchInputOn();
  }
  getRandomCountry(allData);
});

// Input value
searchInput.oninput = function () {
  if (searchInput.value.length > 1) {
    sortResult(findResult(searchInput.value));
  } else if (searchInput.value.length === 1) {
    this.style.color = '#494949';
  } else {
    searchInputOff();
  }
};

// Получение всех стран
const requestAll = function (url) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      allData = Object.assign(allData, data);
      return allData;
    })
    .then((allData) => {
      getRandomCountry(allData);
    })
    .catch((e) => e.message)
    .finally(() => {
      document.querySelector('.preloaddiv').style.display = 'none';
      btn.classList.remove('op0');
      searchInput.focus();
    });
};
requestAll(urlAll);

// Получение случайной страны
const getRandomCountry = function (response) {
  if (!response.message && Object.keys(response).length > 100) {
    const rand = function (min = 0, max = Object.keys(response).length - 1) {
      let r = Math.floor(min + Math.random() * (max + 1 - min));

      getCountry(response[r]);
    };

    rand();
  } else {
    countriesContainer.classList.add('countries-error');
    countriesContainer.insertAdjacentHTML(
      'beforeend',
      `<h1>${response.status} - ${response.statusText}</h1>`
    );
    return false;
  }
};

// Поиск по инпуту
const findResult = function (n) {
  const searchResult = new Set();

  const errLogs = [];
  for (const key in allData) {

    const rusName = Object.values(allData[key].translations.rus);
    const enNameCommon = Object.values(allData[key].name.common).join('').toLowerCase();

    rusName.forEach((e) => {
      if (e.toLowerCase().indexOf(n.toLowerCase()) != -1) {
        searchResult.add(key);
      }
    });

    if (enNameCommon.indexOf(n.toLowerCase()) != -1) {
      searchResult.add(key);
    }
  }
  return searchResult;
};

// Сортировка инпута по алфавиту
function sortResult(searchResult) {
  let sortable = [];
  searchOutUl.innerHTML = ``;
  searchResult.forEach((e) => {
    let item = {
      ind: e,
      name: allData[e].translations.rus.common,
    };
    sortable.push(item);
  });

  const result = sortable.sort((a, b) => (a.name > b.name ? 1 : -1));

  if (result.length > 0 && result.length < 10) {
    result.forEach((e) => {
      searchOutUl.insertAdjacentHTML(
        'beforeend',
        `<li class="searchOutLi" data-key="${e.ind}">${e.name}</li>`
      );
    });
    searchInputOn();
    searchInputEvent();
  } else if (result.length >= 10) {
    searchOutUl.insertAdjacentHTML(
      'beforeend',
      `<li class="searchOutLi" style="color: #bdbdbd">${result.length} countries found</li>`
    );
    searchInputOn();
  }
  if (searchInput.value.length > 1 && result.length <= 0) {
    searchInputOff();
  }
}

// Отрисовка карточки страны
const getCountry = function (countryNum) {
  countriesContainer.innerHTML = '';

  // Валюта
  let currensySufix = 'а';
  let currensyName = `<span>No Data</span>`;
  if (countryNum.currencies) {
    const currencies = countryNum.currencies;

    if (currencies && Object.keys(currencies).length === 1) {
      currensyName = `<span>${Object.values(currencies)[0].name}</span>`;
    } else if (currencies && Object.keys(currencies).length > 1) {
      currensySufix = 'ы';
      currensyName = `<span>${Object.values(currencies)[0].name} <br> and ${
        Object.keys(currencies).length - 1
      } other
      <i id="currensyMore" class="tooltip">?
        <span class="tooltiptext tooltiptextCurrensy hide"></span>
      </i>
    <span>
    `;
    }
  } else {
    console.log(countryNum.name.common);
  }

  // Отображение языков в карточке
  let langOut;
  let langSufix = '';
  if (countryNum.languages) {
    const langs = Object.values(countryNum.languages);
    langOut = `${langs[0]}, ${langs[1]}`;

    if (langs.length > 2) {
      langOut = `${langOut} <br> 
      <span >and ${langs.length - 2} more
                  <i id="langMore" class="tooltip">?
                    <span class="tooltiptext tooltiptextLang hide"></span>
                  </i>
      </span>
      `;
      langSufix = 'и';
    } else if (langs.length === 2) {
      langOut = langOut;
      langSufix = 'и';
    } else if (langs.length == 1) {
      langOut = `${langs[0]}`;
      langSufix = langSufix;
    }
  } else {
    langOut = `No Data`;
  }

  // Население
  let populationIf = +countryNum.population;
  if (populationIf > 100 ** 3) {
    populationIf = `${(+populationIf / 1000000).toFixed(1)} млн.`;
  } else {
    populationIf = populationIf.toLocaleString();
  }

  // Столица
  let capital = `No capital`;
  if (countryNum.capital) {
    capital = `${countryNum.capital[0]}`;
  } else {
    capital = `No Data`;
  }

  // Территория
  let area = +countryNum.area;
  if (area > 999 && area <= 999999) {
    area = `${(area / 1000).toFixed(1)} тыс. км<sup>2</sup>`;
  } else if (area > 1000000) {
    area = `${(area / 1000000).toFixed(1)} млн. км<sup>2</sup>`;
  } else if (area == -1) {
    area = `No Data`;
  } else {
    area = `${area} км<sup>2</sup>`;
  }

  // Регион
  let region = countryNum.subregion;
  if (countryNum.subregion) {
    region = countryNum.subregion;
  } else {
    region = countryNum.continents[0];
  }

  // Загрузка флага
  function loadImage(src, imgBlock) {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = function () {
        resolve(img);
        document.querySelector('.loader').classList.add('hide');
        imgBlock.src = src;
      };
      img.src = src;
    });
  }

  // Соседние страны 'Соседи(число)'
  let borderCountriesLength = 0;
  const borderCountries = countryNum.borders;
  const bordersNameArr = [];
  const bordersFlagArr = [];

  if (countryNum.borders) {
    let length = countryNum.borders.length;
    borderCountries.forEach(function (e) {
      let name = 'name';

      for (let key in allData) {
        if (allData[key].cca3 === e) {
          bordersNameArr.push(allData[key].name.common);
          bordersFlagArr.push(key);
        }
      }
    });
    borderCountriesLength = `
    <i id="nameBorders" class="tooltip">${length}<span class="tooltiptext tooltiptextBorders hide"></span>
    </i>`;
  }

  //Отрисовка флагов соседей
  function loadFlagBorder(arr) {
    let bordersFlagContainer = document.getElementById('bordersFlag');
    if (arr.length > 0) {
      arr.forEach(function (e) {
        bordersFlagContainer.insertAdjacentHTML(
          'beforeend',
          `<div class="bordsrsFlagItem tooltip tooltip__without-border"> 
            <img class="country-borders__img" data-key="${e}" 
            src="https://flagcdn.com/${allData[e].cca2.toLowerCase()}.svg">
            <div class="cca3">${allData[e].cca3}</div>
              
                <span class="tooltiptext tooltiptextBorders tooltip-flagBorders hide">
                  ${allData[e].translations.rus.common}
                </span>
              
        </div>
        `
        );
      });
      const clickToBorderFlag = function () {
        document.getElementById('bordersFlag').onclick = function (e) {
          getCountry(allData[e.target.getAttribute('data-key')]);
        };
      };

      clickToBorderFlag();
    } else {
      bordersFlagContainer.insertAdjacentHTML('beforeend', `<span>No Data</span>`);
    }
  }

  const html = `
        <article class="country ">
            <!-- <img class="country__img" src="${countryNum.flags.svg}" /> -->
            <div class="country__img__wrapper  ">
            <div class="loader"></div>
              <img id="countryFlag" class="country__img" src="${countryNum.flags.svg}" />
            </div>
            <div class="country__data">
              <h4 class="country__name">${countryNum.name.common} <p>(${countryNum.translations.rus.common})</p></h4>
              <div class="country__data__row">
                <h4 class="country__region">${region}</h4>
                <a href="${countryNum.maps.googleMaps}" target="_blank">Google Maps</a>
              </div>
                <p class="country__row"><span>Территория:</span> ${area}</p>
                <p class="country__row"><span>Население:</span> ${populationIf} </p>
                <p class="country__row"><span>Столица:</span> ${capital}</p>
                <p class="country__row"><span>Язык${langSufix}:</span><span>${langOut}</span></p>
                <p class="country__row"><span>Валют${currensySufix}:</span>${currensyName}</p>
                <div class="country__row"><span>Соседи (${borderCountriesLength}):</span>
                    <div id="bordersFlag"></div>
                </div>
            </div>
        </article>
        `;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;

  loadImage(`${countryNum.flags.svg}`, document.getElementById('countryFlag'));

  if (countryNum.languages) {
    addToTooltip(Object.values(countryNum.languages), '.tooltiptextLang');
  }
  if (countryNum.currencies) {
    addToTooltip(Object.values(countryNum.currencies), '.tooltiptextCurrensy');
  }
  if (countryNum.borders) {
    addToTooltip(Object.values(bordersNameArr), '.tooltiptextBorders');
  }

  //console.log(bordersFlagArr);

  loadFlagBorder(bordersFlagArr);
};

const searchInputEvent = function () {
  divSearchResult.onclick = function (e) {
    getCountry(allData[e.target.getAttribute('data-key')]);
    searchInput.value = '';
    searchInputOff();
    searchInput.focus();
  };
};

const searchInputOn = function () {
  searchInput.classList.add('searchWrapper-on');
  divSearchResult.style.display = 'flex';
  searchInput.style.color = '#494949';
};

const searchInputOff = function () {
  searchInput.classList.remove('searchWrapper-on');
  divSearchResult.style.display = 'none';
  searchOutUl.innerHTML = ``;
  searchInput.style.color = '#bdbdbd';
  searchInput.focus();
};

// Tooltip для языков и валюты
const addToTooltip = function (arr, place) {
  const tooltipBlock = document.querySelector(place);

  if (tooltipBlock) {
    tooltipBlock.classList.remove('hide');
    let outLangTooltip = '';
    arr.forEach((e) => {
      if (e.name) {
        outLangTooltip += `<p>${e.name}</p>`;
      } else {
        outLangTooltip += `<p>${e}</p>`;
      }
    });
    tooltipBlock.insertAdjacentHTML('beforeend', outLangTooltip);
  }
};
