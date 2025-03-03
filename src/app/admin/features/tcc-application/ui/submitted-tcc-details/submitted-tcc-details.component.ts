import {DecimalPipe, TitleCasePipe} from "@angular/common"
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core"
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
} from "@angular/material/dialog"
import {SubscriptionHandler} from "@shared/utils/subscription-handler.utils"
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator"
import {NgToggleModule} from "ng-toggle-button"

import Swal from "sweetalert2"
import {SweetAlertOptions} from "@shared/utils/sweet-alert.utils"
import {MaterialDialogConfig} from "@shared/utils/material.utils"
import {TccService} from "@admin-pages/tcc-application/services/tcc-application.services"
import {UploadProjectionInterface} from "@admin-pages/annualprojection/features/uploadprojection/data-access/annual-projection.models"
import {SubmittedTccAppResInterface} from "@admin-pages/tcc-application/data-access/tcc.model"
import {ThrotlleQuery} from "@shared/utils/shared.utils"
import {ActivatedRoute, Router} from "@angular/router"
import {TccSubmittedApplicationViewComponent} from "../submitted-tcc-view/submitted-tcc-view.component"
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader"

@Component({
  selector: "app-submitted-tcc-details",
  templateUrl: "./submitted-tcc-details.component.html",
  styleUrl: "./submitted-tcc-details.component.css",
  standalone: true,
  imports: [
    TitleCasePipe,
    DecimalPipe,
    MatPaginatorModule,
    MatDialogClose,
    NgToggleModule,
    NgxSkeletonLoaderModule,
  ],
  providers: [TccService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TccSubmittedApplicationDetailsComponent
  implements OnInit, OnDestroy
{
  private readonly tccService = inject(TccService)
  private readonly dialog = inject(MatDialog)
  private readonly injectedData =
    inject<UploadProjectionInterface>(MAT_DIALOG_DATA)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  employeeDetails = signal<SubmittedTccAppResInterface | null>(null)
  dataLoading = signal(false)
  btnLoading = signal(false)
  dataMessage = signal("")

  queryString = signal("")

  pageSize = signal(10)
  totalLength = signal(0)
  pageIndex = signal(1)

  subs = new SubscriptionHandler()

  ngOnInit(): void {
    this.getTccDetails()
  }

  ngOnDestroy(): void {
    this.subs.clear()
  }

  getTccDetails(pageNumber?: number, pageSize?: number, employeeRin?: string) {
    this.dataLoading.set(true)
    this.subs.add = this.tccService
      .getSubmittedTcc(
        pageNumber,
        pageSize,
        this.injectedData.businessID,
        employeeRin
      )
      .subscribe({
        next: (res) => {
          this.dataLoading.set(false)
          if (res.status) {
            this.employeeDetails.set(res.data)
          } else {
            this.dataLoading.set(false)
            this.dataMessage.set(res?.message)
            Swal.fire(SweetAlertOptions(res?.message))
          }
        },
        error: (err) => {
          this.dataLoading.set(false)
          this.dataMessage.set(err?.error?.message || err?.message)
          this.resetPagination()
          Swal.fire(SweetAlertOptions(err?.error?.message || err?.message))
        },
      })
  }

  handlePageEvent(event: PageEvent) {
    const pageIndex = event.pageIndex === 0 ? 1 : event.pageIndex
    this.getTccDetails(pageIndex, event.pageSize)
  }

  openTccView() {
    this.dialog.open(
      TccSubmittedApplicationViewComponent,
      MaterialDialogConfig(this.employeeDetails())
    )
  }

  resetPagination() {
    this.totalLength.set(0)
    this.pageIndex.set(0)
  }

  queryTable(domInput: HTMLInputElement) {
    this.subs.add = ThrotlleQuery(domInput, "keyup").subscribe((query) => {
      this.queryString.set(query)
      this.pageIndex.set(1)
      this.pageSize.set(10)
      this.getTccDetails(1, 10, query)
    })
  }
}
