import * as ordersActions from "@/services/db/ordersActions";
import { ServerActionAdapter } from "@/services/storage/serverActionAdapter";
import type { Order, OrderStatus } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

class OrdersRepository extends BaseRepository<Order> {
  /** Próxima posição livre ao final de uma coluna (novo card entra por último). */
  async nextPosicao(status: OrderStatus): Promise<number> {
    const orders = await this.list();
    const daColuna = orders.filter((o) => o.status === status);
    return daColuna.reduce((acc, o) => Math.max(acc, o.posicao + 1), 0);
  }
}

export const ordersRepository = new OrdersRepository(
  new ServerActionAdapter<Order>(ordersActions),
);
