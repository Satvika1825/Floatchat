import xarray as xr
import pandas as pd

def argo_to_csv(netcdf_file_path, csv_file_path):
    ds = xr.open_dataset(netcdf_file_path)

    records = []

    for i in range(ds.sizes["N_PROF"]):
        meta = {
            "profile_id": int(i),
            "platform_number": str(ds["PLATFORM_NUMBER"].values[i]),
            "cycle_number": int(ds["CYCLE_NUMBER"].values[i]),
            "latitude": float(ds["LATITUDE"].values[i]),
            "longitude": float(ds["LONGITUDE"].values[i]),
            "date": pd.to_datetime(ds["JULD"].values[i]),
            "data_mode": str(ds["DATA_MODE"].values[i]).replace("b'", "").replace("'", "")
        }

        pres = ds["PRES"][i].values
        temp = ds["TEMP"][i].values
        psal = ds["PSAL"][i].values

        for depth, t, s in zip(pres, temp, psal):
            if pd.notna(t) and pd.notna(s):
                records.append({
                    **meta,
                    "depth": float(depth),
                    "temperature": float(t),
                    "salinity": float(s)
                })

    df = pd.DataFrame(records)

    df.to_csv(csv_file_path, index=False)
    print(f"Saved {len(df)} rows to {csv_file_path}")
    return df


if __name__ == "__main__":
    netcdf_file_path = "data/20250101_prof.nc"
    csv_file_path = "data/20250101_prof.csv"
    df = argo_to_csv(netcdf_file_path, csv_file_path)
    print(df.head())
