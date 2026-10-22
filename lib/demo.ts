/** Демо-витрина /dev/shop и заглушка оплаты включаются переменной DEMO_SHOP=1. */
export const isDemoShop = () => process.env.DEMO_SHOP === "1";
