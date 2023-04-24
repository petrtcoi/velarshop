import {expect, Page, test} from '@playwright/test';

const SCREEN_LG = 1024;



test.describe('Index page', () => {

  const burgerMenu = (page: Page) => page.getByTestId('burger_menu');
  const catalogSubmenu = (page: Page) => page.getByRole('menu', {name: 'Разделы каталога продукции'});
  const menuBar = (page: Page) => page.getByRole('menubar', {name: 'Главное меню'});

  const setSmallScreen = (page: Page) => page.setViewportSize({width: SCREEN_LG - 1, height: 600});
  const setLargeScreen = (page: Page) => page.setViewportSize({width: SCREEN_LG + 1, height: 1600});

  test('Index render logo', async ({page}) => {
    await page.goto('/');
    const logo = await page.getByTestId('velar_logo');
    expect(logo).toBeTruthy();
  });


  // Show / hide burger menu

  test(`Dont show burger menu on large screen +${SCREEN_LG}px`, async ({page}) => {
    await page.goto('/');
    setLargeScreen(page);
    await expect(burgerMenu(page)).not.toBeVisible();
  });

  test(`Show burger menu on Screen smaller ${SCREEN_LG}px`, async ({page}) => {
    await page.goto('/');
    setSmallScreen(page);
    await expect(burgerMenu(page)).toBeVisible();
  });


  // Show hide catalog submenu

  test(`Show catalog submenu on large screen +${SCREEN_LG}px`, async ({page}) => {
    await page.goto('/');
    setLargeScreen(page);
    await expect(catalogSubmenu(page)).toBeVisible();
  });

  test(`Show catalog submenu on small screen -${SCREEN_LG}px`, async ({page}) => {
    await page.goto('/');
    setSmallScreen(page);
    await expect(catalogSubmenu(page)).not.toBeVisible();
  });

  // Show menu after click at burger

  test(`Menu not shown on small screen`, async ({page}) => {
    await page.goto('/');
    setSmallScreen(page);
    await expect(menuBar(page)).not.toBeVisible();
  });

  test(`Menu toggle by click on Burger small screen`, async ({page}) => {
    await page.goto('/');
    setSmallScreen(page);
    await burgerMenu(page).click();
    await expect(menuBar(page)).toBeVisible();
    await burgerMenu(page).click();
    await expect(menuBar(page)).not.toBeVisible();
  });

});