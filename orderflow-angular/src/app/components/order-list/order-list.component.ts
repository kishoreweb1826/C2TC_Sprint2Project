import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderDetails, OrderStats, PAYMENT_MODES } from '../../models/order-details.model';
import { OrderDetailsService } from '../../services/order-details.service';
import { ToastService } from '../../services/toast.service';
import { OrderFormComponent } from '../order-form/order-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderFormComponent, ConfirmDialogComponent],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {

  // Data
  allOrders: OrderDetails[] = [];
  filtered: OrderDetails[] = [];
  paginated: OrderDetails[] = [];
  stats: OrderStats = { total: 0, revenue: 0, avgOrder: 0, uniqueCustomers: 0 };
  loading = true;

  // Filters
  searchQuery = '';
  paymentFilter = '';
  readonly paymentModes = PAYMENT_MODES;

  // Sort
  sortField: keyof OrderDetails = 'id';
  sortDir: SortDir = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Modals
  showForm = false;
  editOrder: OrderDetails | null = null;
  showConfirm = false;
  deleteTarget: OrderDetails | null = null;

  constructor(
    private orderService: OrderDetailsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // ── LOAD ──────────────────────────────────────
  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.allOrders = data;
        this.updateStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.toast.error(err.message);
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadOrders();
    this.toast.info('Refreshing orders...');
  }

  // ── STATS ─────────────────────────────────────
  updateStats(): void {
    const n = this.allOrders.length;
    const rev = this.allOrders.reduce((s, o) => s + (o.total || 0), 0);
    this.stats = {
      total: n,
      revenue: rev,
      avgOrder: n ? rev / n : 0,
      uniqueCustomers: new Set(this.allOrders.map(o => o.customerId)).size
    };
  }

  // ── FILTER / SEARCH ───────────────────────────
  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    const pm = this.paymentFilter.toLowerCase();
    this.filtered = this.allOrders.filter(o => {
      const matchQ = !q || [
        String(o.id),
        String(o.customerId),
        (o.shopId || '').toLowerCase(),
        (o.paymentMode || '').toLowerCase()
      ].some(v => v.includes(q));
      const matchPM = !pm || (o.paymentMode || '').toLowerCase() === pm;
      return matchQ && matchPM;
    });
    this.sortData();
    this.currentPage = 1;
    this.updatePagination();
  }

  onSearch(): void  { this.applyFilters(); }
  onFilter(): void  { this.applyFilters(); }
  clearSearch(): void { this.searchQuery = ''; this.applyFilters(); }

  // ── SORT ──────────────────────────────────────
  sortBy(field: keyof OrderDetails): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.sortData();
    this.updatePagination();
  }

  sortData(): void {
    this.filtered = [...this.filtered].sort((a, b) => {
      let va: any = a[this.sortField];
      let vb: any = b[this.sortField];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb as string).toLowerCase(); }
      if (va < vb) return this.sortDir === 'asc' ? -1 : 1;
      if (va > vb) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(field: keyof OrderDetails): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  // ── PAGINATION ────────────────────────────────
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filtered.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginated = this.filtered.slice(start, start + this.pageSize);
  }

  goPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.updatePagination();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginationStart(): number { return (this.currentPage - 1) * this.pageSize + 1; }
  get paginationEnd(): number   { return Math.min(this.currentPage * this.pageSize, this.filtered.length); }

  // ── CREATE ────────────────────────────────────
  openCreate(): void {
    this.editOrder = null;
    this.showForm = true;
  }

  // ── EDIT ──────────────────────────────────────
  openEdit(order: OrderDetails): void {
    this.editOrder = { ...order };
    this.showForm = true;
  }

  // ── DELETE ────────────────────────────────────
  openDelete(order: OrderDetails): void {
    this.deleteTarget = order;
    this.showConfirm = true;
  }

  onConfirmDelete(): void {
    if (!this.deleteTarget?.id) return;
    this.orderService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.allOrders = this.allOrders.filter(o => o.id !== this.deleteTarget!.id);
        this.toast.success(`Order #${this.deleteTarget!.id} deleted successfully`);
        this.deleteTarget = null;
        this.showConfirm = false;
        this.updateStats();
        this.applyFilters();
      },
      error: (err) => this.toast.error(err.message)
    });
  }

  onCancelDelete(): void {
    this.showConfirm = false;
    this.deleteTarget = null;
  }

  // ── FORM SAVE ─────────────────────────────────
  onFormSave(order: OrderDetails): void {
    if (order.id) {
      // Update
      this.orderService.update(order.id, order).subscribe({
        next: (updated) => {
          const idx = this.allOrders.findIndex(o => o.id === updated.id);
          if (idx !== -1) this.allOrders[idx] = updated;
          this.toast.success(`Order #${updated.id} updated successfully`);
          this.showForm = false;
          this.updateStats();
          this.applyFilters();
        },
        error: (err) => this.toast.error(err.message)
      });
    } else {
      // Create
      this.orderService.create(order).subscribe({
        next: (created) => {
          this.allOrders.unshift(created);
          this.toast.success('Order created successfully');
          this.showForm = false;
          this.updateStats();
          this.applyFilters();
        },
        error: (err) => this.toast.error(err.message)
      });
    }
  }

  onFormClose(): void { this.showForm = false; }

  // ── HELPERS ───────────────────────────────────
  formatDate(dt: string): string {
    if (!dt) return '—';
    try {
      const d = new Date(dt);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
           + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return dt; }
  }

  formatCurrency(n: number): string {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatNumber(n: number): string {
    return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  getBadgeClass(pm: string): string {
    const map: Record<string, string> = {
      upi: 'badge-upi', card: 'badge-card',
      cash: 'badge-cash', netbanking: 'badge-netbanking'
    };
    return 'badge ' + (map[(pm || '').toLowerCase()] || 'badge-default');
  }

  trackById(_: number, o: OrderDetails): number { return o.id!; }
}
