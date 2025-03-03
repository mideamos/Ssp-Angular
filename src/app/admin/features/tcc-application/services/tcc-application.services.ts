import {HttpClient, HttpParams} from "@angular/common/http"
import {inject, Injectable} from "@angular/core"
import {environment} from "@environment/environment"
import {ServerResInterface} from "@shared/types/server-response.model"
import {UploadProjectioResInterface} from "@admin-pages/annualprojection/features/uploadprojection/data-access/annual-projection.models"
import * as TccModels from "../data-access/tcc.model"

@Injectable({providedIn: "any"})
export class TccService {
  private readonly httpClient = inject(HttpClient)

  getBusinesses(
    pageNumber: number,
    pageSize: number,
    companyId: string,
    search?: string
  ) {
    const params = new HttpParams({
      fromObject: {
        pageNumber,
        pageSize,
        ...(search && {busRin: search}),
      },
    })
    return this.httpClient.get<ServerResInterface<UploadProjectioResInterface>>(
      `${environment.AUTHAPIURL}SSP/FormH1/getallformh1bycompanyId/${companyId}`,
      {params}
    )
  }

  getTccDetails(pageNumber = 1, pageSize = 15, busId: string, search?: string) {
    const params = new HttpParams({
      fromObject: {
        pageNumber,
        pageSize,
        busId,
        ...(search && {businessName: search}),
      },
    })
    return this.httpClient.get<
      ServerResInterface<TccModels.TccAppDetailsInterface[]>
    >(`${environment.AUTHAPIURL}PhaseII/GetSubmitedTccApplicationView`, {
      params,
    })
  }

  getPendingTcc(pageNumber = 1, pageSize = 15, busId: string, search?: string) {
    const params = new HttpParams({
      fromObject: {
        pageNumber,
        pageSize,
        busId,
        ...(search && {businessName: search}),
      },
    })
    return this.httpClient.get<
      ServerResInterface<TccModels.PendingTccResInterface[]>
    >(`${environment.AUTHAPIURL}PhaseII/GetTccApplicationToBeSubmitted`, {
      params,
    })
  }

  getSubmittedTcc(
    pageNumber = 1,
    pageSize = 15,
    busId: string,
    search?: string
  ) {
    const params = new HttpParams({
      fromObject: {
        pageNumber,
        pageSize,
        busId,
        ...(search && {businessName: search}),
      },
    })
    return this.httpClient.get<
      ServerResInterface<TccModels.SubmittedTccAppResInterface>
    >(`${environment.AUTHAPIURL}PhaseII/GetSubmitedTccApplication`, {
      params,
    })
  }

  getSubmittedTccView(
    pageNumber = 1,
    pageSize = 15,
    busId: string,
    search?: string
  ) {
    const params = new HttpParams({
      fromObject: {
        pageNumber,
        pageSize,
        busId,
        ...(search && {businessName: search}),
      },
    })
    return this.httpClient.get<
      ServerResInterface<TccModels.TccAppDetailsInterface[]>
    >(`${environment.AUTHAPIURL}PhaseII/GetSubmitedTccApplicationView`, {
      params,
    })
  }

  processTcc(payload: any) {
    return this.httpClient.post<ServerResInterface<any>>(
      `${environment.AUTHAPIURL}PhaseII/SendTcc`,
      payload
    )
  }
}
