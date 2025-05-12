import React, { useState, useEffect, useRef } from 'react';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef(null);
  const confirmDialog = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProducts();
        console.log('Полученные данные продуктов:', JSON.stringify(data, null, 2));
        console.log('Структура первого продукта:', JSON.stringify(data[0], null, 2));
        console.log('Поля продукта:', Object.keys(data[0]));
        console.log('Значения полей первого продукта:', Object.entries(data[0]).map(([key, value]) => `${key}: ${value}`));
          setProducts(data);
      } catch (err) {
        console.error('Ошибка при загрузке продуктов:', err);
        setError(err.message || 'Ошибка при загрузке продуктов');
        toast.current.show({
          severity: 'error',
          summary: 'Ошибка',
          detail: err.message || 'Не удалось загрузить список продуктов',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const confirmDelete = (product) => {
    confirmDialog.current.show({
      message: `Are you sure you want to delete product "${product.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => handleDelete(product.gtin)
    });
  };

  const handleDelete = async (gtin) => {
    try {
      await deleteProduct(gtin);
      setProducts(products.filter(p => p.gtin !== gtin));
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Product has been deleted',
        life: 3000
      });
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to delete product',
        life: 3000
      });
    }
  };

  const formatColumnHeader = (fieldName) => {
    const headerMap = {
      product_id: 'ID',
      gtin13: 'GTIN-13',
      product_name: 'Name',
      status: 'Status',
      customer_name: 'Company',
      entity: 'Category'
    };
    return headerMap[fieldName] || fieldName;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`px-2 py-1 rounded-full text-sm ${rowData.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {rowData.status ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-external-link"
          className="p-button-rounded p-button-secondary p-button-sm"
          onClick={() => window.open(`/products/${rowData.gtin13}`, '_blank')}
          tooltip="Open public page"
        />
        <Button
          icon="pi pi-list"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => navigate(`/admin/products/${rowData.gtin13}`)}
          tooltip="View details"
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => navigate(`/admin/products/edit/${rowData.gtin13}`)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Delete"
        />
      </div>
    );
  };

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">All Products</h2>
      <div className="flex gap-3 items-center">
        <div className="relative">
          <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="pl-10 w-64"
          />
        </div>
        <Button
          label="Add Product"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => navigate('/admin/products/create')}
        />
      </div>
    </div>
  );

  const filterProducts = (products, filter) => {
    if (!filter) return products;
    
    const searchTerm = filter.toLowerCase();
    return products.filter(product => 
      product.gtin13?.toLowerCase().includes(searchTerm) ||
      product.customer_name?.toLowerCase().includes(searchTerm) ||
      product.product_name?.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog ref={confirmDialog} />
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
          {error}
        </div>
      )}

      <Card>
        <DataTable
          value={filterProducts(products, globalFilter)}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          globalFilter={globalFilter}
          header={header}
          emptyMessage={loading ? "Loading..." : "No products found"}
          loading={loading}
          className="p-datatable-sm"
          stripedRows
          showGridlines
          responsiveLayout="scroll"
        >
          <Column field="customer_name" header="Company" sortable style={{ width: '180px' }} />
          <Column field="gtin13" header="GTIN-13" sortable style={{ width: '150px' }} />
          <Column field="product_name" header="Name" sortable style={{ minWidth: '200px' }} />
          <Column field="entity" header="Category" sortable style={{ width: '150px' }} />
          <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: '120px' }} />
          <Column
            body={actionBodyTemplate}
            header="Actions"
            style={{ width: '180px' }}
            exportable={false}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default Products;