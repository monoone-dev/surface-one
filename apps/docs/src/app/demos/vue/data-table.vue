<script setup lang="ts">
import { ref } from "vue";
import {
  SoneDataTable,
  type SoneDataTableColumn,
  type SoneDataTableKey,
} from "@surface-one/vue";

interface Payment {
  id: string;
  status: string;
  email: string;
  amount: number;
  total: string;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const payment = (id: string, status: string, email: string, amount: number): Payment => ({
  id,
  status,
  email,
  amount,
  total: usd.format(amount),
});

const payments: Payment[] = [
  payment("m5gr84i9", "Success", "ken99@example.com", 316),
  payment("3u1reuv4", "Success", "abe45@example.com", 242),
  payment("derv1ws0", "Processing", "monserrat44@example.com", 837),
  payment("5kma53ae", "Success", "silas22@example.com", 874),
  payment("bhqecj4p", "Failed", "carmella@example.com", 721),
  payment("p0r8x1kq", "Pending", "lena.k@example.com", 129),
  payment("w2n7c6ty", "Success", "omar@example.com", 560),
  payment("z9h3b5vd", "Processing", "ines@example.com", 95),
];

const columns: SoneDataTableColumn<Payment>[] = [
  { key: "status", header: "Status", sortable: true },
  { key: "email", header: "Email", sortable: true },
  { key: "total", header: "Amount", sortable: true, alignEnd: true, width: "8rem", value: (p) => p.amount },
];

const selected = ref<SoneDataTableKey[]>([]);
const byId = (p: Payment) => p.id;
const byEmail = (p: Payment) => p.email;
</script>

<template>
  <SoneDataTable
    v-model:selected="selected"
    :rows="payments"
    :columns="columns"
    :row-key="byId"
    :row-label="byEmail"
    :page-size="5"
    filterable
    selectable
    column-toggle
  />
</template>
