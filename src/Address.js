// src/Address.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "./dbServer";
import "./styles/address-styles.css";

// Pullers from your PhilippineAddressAPI (as in ClientCreationForm.txt)
import {
  fetchRegions,
  fetchProvinces,
  fetchCities,
  fetchBarangays,
  fetchCitiesForNCR,
} from "./Actions/PhilippineAddressAPI";

const CLIENTS_TABLE = "clients_Table";

/* =========================================================================
   Address (list + edit)
   ========================================================================= */
export default function Address() {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [original, setOriginal] = useState(null); // single (default) address
  const [view, setView] = useState("list");       // "list" | "edit"

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data: u } = await db.auth.getUser();
        if (!u?.user?.id) {
          setAuthUser(null);
          return;
        }
        setAuthUser(u.user);

        const { data: row, error } = await db
          .from(CLIENTS_TABLE)
          .select(
            "uid, auth_id, address, barangay_address, city_address, province_address, region_address, zip_code"
          )
          .eq("auth_id", u.user.id)
          .single();

        if (!error && row) {
          mounted &&
            setOriginal({
              id: "original",
              auth_id: u.user.id,
              street_address: row.address || "",
              barangay: row.barangay_address || "",
              city: row.city_address || "",
              province: row.province_address || "",
              region: row.region_address || "",
              zip_code: row.zip_code ?? "",
              is_default: true, // always default
            });
        } else {
          mounted && setOriginal(null);
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const refresh = async () => {
    if (!authUser?.id) return;
    const { data: row } = await db
      .from(CLIENTS_TABLE)
      .select(
        "uid, auth_id, address, barangay_address, city_address, province_address, region_address, zip_code"
      )
      .eq("auth_id", authUser.id)
      .single();

    setOriginal(
      row
        ? {
            id: "original",
            auth_id: authUser.id,
            street_address: row.address || "",
            barangay: row.barangay_address || "",
            city: row.city_address || "",
            province: row.province_address || "",
            region: row.region_address || "",
            zip_code: row.zip_code ?? "",
            is_default: true,
          }
        : null
    );
  };

  if (loading) return <div className="addr-loading">Loading…</div>;

  if (view === "list") {
    const a = original;
    const line =
      [a?.street_address, a?.barangay, a?.city, a?.province, a?.region]
        .filter(Boolean)
        .join(", ") + (a?.zip_code ? `, ${a.zip_code}` : "");

    return (
      <div className="addr-wrap">
        <div className="addr-header">
          <h2>Address</h2>
          {/* no New button */}
        </div>

        <div className="addr-row">
          <div className="addr-line">
            <span className="addr-text">{line || "—"}</span>
            {a?.is_default && <span className="addr-badge">Default</span>}
          </div>

          <div className="addr-actions">
            <button className="addr-link" onClick={() => setView("edit")}>Edit</button>
          </div>
        </div>
      </div>
    );
  }

  // Edit view
  return (
    <AddressForm
      initial={original}
      onCancel={() => setView("list")}
      onSaved={async () => {
        await refresh();
        setView("list");
      }}
    />
  );
}

/* =========================================================================
   AddressForm (Edit only)
   ========================================================================= */
function AddressForm({ initial, onCancel, onSaved }) {
  // Lists
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // Selected codes (what API needs)
  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");

  // Field values (human names)
  const [street, setStreet] = useState(initial?.street_address || "");
  const [regionName, setRegionName] = useState(initial?.region || "");
  const [provinceName, setProvinceName] = useState(initial?.province || "");
  const [cityName, setCityName] = useState(initial?.city || "");
  const [barangayName, setBarangayName] = useState(initial?.barangay || "");
  const [zip, setZip] = useState(initial?.zip_code ? String(initial.zip_code) : "");

  const [errors, setErrors] = useState({});

  // keep originals for matching
  const initialRef = useRef({
    region: initial?.region || "",
    province: initial?.province || "",
    city: initial?.city || "",
    barangay: initial?.barangay || "",
  });

  // tolerant string matcher
  const norm = (s) =>
    (s || "")
      .toLowerCase()
      .replace(/^city of\s+/g, "")
      .replace(/[.,]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const findByName = (arr, name) => arr.find((x) => norm(x.name) === norm(name));

  const isNCR = useMemo(() => {
    const r = regions.find((r) => r.code === regionCode);
    return r?.name?.toLowerCase().includes("national capital region") || regionCode === "130000000";
  }, [regionCode, regions]);

  // Load regions + preselect by saved region name
  useEffect(() => {
    (async () => {
      const rs = await fetchRegions();
      setRegions(rs || []);
      if (initialRef.current.region) {
        const r = findByName(rs || [], initialRef.current.region);
        if (r) setRegionCode(r.code);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Region change → load provinces (non-NCR) or cities (NCR), then preselect
  useEffect(() => {
    (async () => {
      setProvinceCode("");
      setCityCode("");
      setProvinces([]);
      setCities([]);
      setBarangays([]);

      const rObj = regions.find((r) => r.code === regionCode);
      setRegionName(rObj?.name || "");
      if (!regionCode) return;

      if (isNCR) {
        const cs = await fetchCitiesForNCR();
        setCities(cs || []);
        const c = findByName(cs || [], initialRef.current.city);
        if (c) setCityCode(c.code);
      } else {
        const ps = await fetchProvinces(regionCode);
        setProvinces(ps || []);
        const p = findByName(ps || [], initialRef.current.province);
        if (p) setProvinceCode(p.code);
      }
    })();
  }, [regionCode, regions, isNCR]);

  // Province change (non-NCR) → load cities, preselect by saved city name
  useEffect(() => {
    (async () => {
      if (!provinceCode || isNCR) return;
      const p = provinces.find((x) => x.code === provinceCode);
      setProvinceName(p?.name || "");

      const cs = await fetchCities(provinceCode);
      setCities(cs || []);
      const c = findByName(cs || [], initialRef.current.city);
      if (c) setCityCode(c.code);
    })();
  }, [provinceCode, isNCR, provinces]);

  // City change → load barangays, preselect by saved barangay name
  useEffect(() => {
    (async () => {
      if (!cityCode) return;
      const c = cities.find((x) => x.code === cityCode);
      setCityName(c?.name || "");

      const bs = await fetchBarangays(cityCode);
      setBarangays(bs || []);
      const b = findByName(bs || [], initialRef.current.barangay);
      if (b) setBarangayName(b.name);
    })();
  }, [cityCode, cities]);

  // Validate + Save
  const validate = () => {
    const e = {};
    if (!street.trim()) e.street = "Street Address is required";
    if (!regionName) e.region = "Region is required";
    if (!isNCR && !provinceName) e.province = "Province is required";
    if (!cityName) e.city = "City is required";
    if (!barangayName) e.barangay = "Barangay is required";
    if (!zip || !/^\d{4}$/.test(zip)) e.zip = "ZIP code is required (4 digits)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await db
      .from(CLIENTS_TABLE)
      .update({
        address: street.trim(),
        region_address: regionName,
        province_address: isNCR ? "" : provinceName,
        city_address: cityName,
        barangay_address: barangayName,
        zip_code: parseInt(zip, 10),
      })
      .eq("auth_id", initial.auth_id);

    await onSaved();
  };

  return (
    <div className="addr-form-wrap">
      <h2>Edit Address</h2>

      <div className="addr-grid">
        <div className="addr-field">
          <label>Street Address/ Unit No. *</label>
          <input value={street} onChange={(e) => setStreet(e.target.value)} />
          {errors.street && <small className="addr-err">{errors.street}</small>}
        </div>

        <div className="addr-two">
          <div className="addr-field">
            <label>Region *</label>
            <select value={regionCode} onChange={(e) => setRegionCode(e.target.value)}>
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
            {errors.region && <small className="addr-err">{errors.region}</small>}
          </div>

          <div className="addr-field">
            <label>Province {isNCR ? "(auto N/A)" : "*"}</label>
            <select value={provinceCode} onChange={(e) => setProvinceCode(e.target.value)} disabled={isNCR}>
              <option value="">{isNCR ? "—" : "Select Province"}</option>
              {!isNCR && provinces.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            {!isNCR && errors.province && <small className="addr-err">{errors.province}</small>}
          </div>
        </div>

        <div className="addr-two">
          <div className="addr-field">
            <label>Municipality *</label>
            <select value={cityCode} onChange={(e) => setCityCode(e.target.value)}>
              <option value="">Select City/Municipality</option>
              {cities.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            {errors.city && <small className="addr-err">{errors.city}</small>}
          </div>

          <div className="addr-field">
            <label>Barangay *</label>
            <select value={barangayName} onChange={(e) => setBarangayName(e.target.value)} disabled={!cityCode}>
              <option value="">Select Barangay</option>
              {barangays.map((b) => (
                <option key={b.code} value={b.name}>{b.name}</option>
              ))}
            </select>
            {errors.barangay && <small className="addr-err">{errors.barangay}</small>}
          </div>
        </div>

        <div className="addr-two">
          <div className="addr-field">
            <label>ZIP code *</label>
            <input
              value={zip}
              inputMode="numeric"
              maxLength={4}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
            {errors.zip && <small className="addr-err">{errors.zip}</small>}
          </div>
          <div />
        </div>
      </div>

      <div className="addr-actions-bar">
        <button type="button" className="addr-btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="button" className="addr-btn-save" onClick={handleSave}>Save changes</button>
      </div>
    </div>
  );
}
