import {expect, test} from '@playwright/test';
import type {Page} from '@playwright/test';

const SCREEN_LG = 901;



test.describe('Index page', () => {

  const burgerMenu = (page: Page) => page.locator('.mobile-burger');
  const desktopMenu = (page: Page) => page.locator('.desktop-menu');
  const menuBar = (page: Page) => page.locator('details.mobile-menu');

  const setSmallScreen = (page: Page) => page.setViewportSize({width: SCREEN_LG - 1, height: 600});
  const setLargeScreen = (page: Page) => page.setViewportSize({width: SCREEN_LG + 1, height: 1600});

  test('Index render logo', async ({page}) => {
    await page.goto('/');
    const logo = await page.getByTestId('velar_logo');
    expect(logo).toBeTruthy();
  });


  // Show / hide burger menu

  test(`Dont show burger menu on large screen +${SCREEN_LG}px`, async ({page}) => {
    await setLargeScreen(page);
    await page.goto('/');
    await expect(burgerMenu(page)).not.toBeVisible();
  });

  test(`Show burger menu on Screen smaller ${SCREEN_LG}px`, async ({page}) => {
    await setSmallScreen(page);
    await page.goto('/');
    await expect(burgerMenu(page)).toBeVisible();
  });


  // Show hide catalog submenu

  test(`Show desktop menu on large screen +${SCREEN_LG}px`, async ({page}) => {
    await setLargeScreen(page);
    await page.goto('/');
    await expect(desktopMenu(page)).toBeVisible();
  });

  test(`Hide desktop menu on small screen -${SCREEN_LG}px`, async ({page}) => {
    await setSmallScreen(page);
    await page.goto('/');
    await expect(desktopMenu(page)).not.toBeVisible();
  });

  // Show menu after click at burger

  test(`Menu not shown on small screen`, async ({page}) => {
    await setSmallScreen(page);
    await page.goto('/');
    await expect(menuBar(page)).not.toHaveAttribute('open', '');
  });

  test(`Menu toggle by click on Burger small screen`, async ({page}) => {
    await setSmallScreen(page);
    await page.goto('/');
    await burgerMenu(page).click();
    await expect(menuBar(page)).toHaveAttribute('open', '');
    await page.getByRole('button', {name: 'Закрыть меню'}).click();
    await expect(menuBar(page)).not.toHaveAttribute('open', '');
  });

});
