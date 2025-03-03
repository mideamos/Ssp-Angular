import {SettingsService} from "@admin-pages/settings/data-access/services/system-settings.services"
import {
  AllUsersResInterface,
  ChangeUserActivityInterface,
  ChangeUserRoleInterface,
} from "@admin-pages/settings/data-access/system-settings.model"
import {Component, inject, OnDestroy, OnInit, signal} from "@angular/core"
import {MatFormFieldModule} from "@angular/material/form-field"
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator"
import {MatSelectModule} from "@angular/material/select"
import {ActivatedRoute, Router} from "@angular/router"
import {TokenService} from "@shared/services/token.service"
import {ThrotlleQuery} from "@shared/utils/shared.utils"
import {SubscriptionHandler} from "@shared/utils/subscription-handler.utils"
import {SweetAlertOptions} from "@shared/utils/sweet-alert.utils"
import {NgToggleModule} from "ng-toggle-button"
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader"
import Swal from "sweetalert2"

@Component({
  selector: "app-manage-users",
  standalone: true,
  imports: [
    MatPaginatorModule,
    NgxSkeletonLoaderModule,
    NgToggleModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: "./manage-users.component.html",
  styleUrl: "./manage-users.component.css",
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  public readonly tokenService = inject(TokenService)
  public readonly settingsService = inject(SettingsService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  users = signal<AllUsersResInterface[] | null>(null)

  dataLoading = signal(false)
  dataMessage = signal("")

  queryString = signal("")
  queryType = signal("")

  pageSize = signal(10)
  totalLength = signal(500)
  pageIndex = signal(1)

  subs = new SubscriptionHandler()

  ngOnInit(): void {
    this.listenToRoute()
  }

  ngOnDestroy(): void {
    this.subs.clear()
  }

  listenToRoute() {
    this.subs.add = this.route.queryParams.subscribe((params) => {
      this.dataLoading.set(true)
      if (Object.keys(params)) {
        if (params["pageIndex"]) this.pageIndex.set(+params["pageIndex"])
        if (params["pageSize"]) this.pageSize.set(+params["pageSize"])
        if (params["type"]?.length) this.queryString.set(params["type"])
        if (params["search"]?.length) this.queryString.set(params["search"])
        this.subs.add = this.settingsService
          .getUsers(
            this.pageIndex(),
            this.pageSize(),
            params["type"],
            params["search"]
          )
          .subscribe({
            next: (res) => {
              this.dataLoading.set(false)
              if (res.status === true) {
                this.users.set(res?.data?.result as AllUsersResInterface[])
                this.totalLength.set(res?.data?.totalCount)
              } else {
                this.dataLoading.set(false)
                this.dataMessage.set(res?.message)
                Swal.fire(SweetAlertOptions(res?.message))
              }
            },
            error: (err) => {
              this.dataLoading.set(false)
              this.dataMessage.set(err?.error?.message || err?.message)
              Swal.fire(SweetAlertOptions(err?.error?.message || err?.message))
            },
          })
      }
    })
  }

  queryTable(domInput: HTMLInputElement) {
    this.subs.add = ThrotlleQuery(domInput, "keyup").subscribe((query) => {
      this.router.navigate(["."], {
        relativeTo: this.route,
        queryParams: {
          ...(query?.length && {search: query}),
          pageSize: 10,
          pageIndex: 1,
        },
        queryParamsHandling: "replace",
      })
    })
  }

  queryUserType(event: Event) {
    const query = (event?.target as any)?.value as string
    this.router.navigate(["."], {
      relativeTo: this.route,
      queryParams: {
        type: query,
        pageSize: 10,
        pageIndex: 1,
      },
      queryParamsHandling: "replace",
    })
  }

  handlePageEvent(event: PageEvent) {
    this.router.navigate(["."], {
      relativeTo: this.route,
      queryParams: {
        pageSize: event.pageSize,
        pageIndex: event.pageIndex,
      },
      queryParamsHandling: "replace",
    })
  }

  switchStatus(event: any, user: AllUsersResInterface) {
    const status = event.target.checked as boolean

    const payload: ChangeUserActivityInterface = {
      userId: user?.userId,
      userType: user?.userTypeName,
      status,
    }

    const ask = window.confirm(
      "Are you sure you want to change this user status?"
    )
    if (ask) {
      this.subs.add = this.settingsService
        .changeUserActivity(payload)
        .subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire(SweetAlertOptions(res?.message, true))
              this.listenToRoute()
            }
          },
          error: (err) => {
            Swal.fire(SweetAlertOptions(err?.error?.message || err?.message))
          },
        })
    }
  }

  updateRole(event: any, user: AllUsersResInterface) {
    const userRole = event.target.value as string

    const payload: ChangeUserRoleInterface = {
      userId: user?.userId,
      userRole,
    }

    const ask = window.confirm(
      "Are you sure you want to change this user's role?"
    )
    if (ask) {
      this.subs.add = this.settingsService.changeAdminRole(payload).subscribe({
        next: (res) => {
          if (res.status) {
            Swal.fire(SweetAlertOptions(res?.message, true))
            this.listenToRoute()
          }
        },
        error: (err) => {
          Swal.fire(SweetAlertOptions(err?.error?.message || err?.message))
        },
      })
    }
  }
}
