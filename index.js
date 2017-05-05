// @flow
import axios from 'axios';

const ERROR = {
  MISSING_TOKEN: {
    code: 'missing_token',
    message: 'Missing `id` parameter'
  },
  MISSING_ID: {
    code: 'missing_id',
    message: 'Missing `id` parameter'
  },
  MISSING_FILE_ID: {
    code: 'missing_file_id',
    message: 'Missing `fileId` parameter'
  },
  MISSING_BODY: {
    code: 'missing_body',
    message: 'Missing `body` parameter'
  },
  MISSING_CN: {
    code: 'missing_cn',
    message: 'Missing `cn` parameter'
  },
  MISSING_ALIAS: {
    code: 'missing_body',
    message: 'Missing `alias` parameter'
  },
  MISSING_NAME: {
    code: 'missing_name',
    message: 'Missing `name` parameter'
  },
  MISSING_VALUE: {
    code: 'missing_value',
    message: 'Missing `value` parameter'
  }
};

function handleError(error) {
  return Promise((resolve, reject) => reject(error));
}

export class Now {
  _token: string;
  _baseUrl: string;

  constructor(token: string) {
    if (!token) {
      throw new Error(ERROR.MISSING_TOKEN);
    }
    this._token = token;
    this._baseUrl = 'https://api.zeit.co';
  }
  _generateUrl(path: string) : string {
    if (!path) {
      return this._baseUrl;
    }
    const splitter = path[0] === '/' ? '' : '/';
    return `${this._baseUrl}${splitter}${path}`;
  }
  async handleRequest({ path, method, data }, selector: string) : Promise<Object> {
    const headers = {
      Authorization: `Bearer ${this._token}`
    };
    const url = this._generateUrl(path);
    const response = await axios({ method, url, data, headers });
    return response.data[selector];
  }
  getDeployments() {
    return this.handleRequest({
      path: '/now/deployments',
      method: 'GET'
    }, 'deployments')
  }
  getDeployment(deploymentId: string) {
    if (!deploymentId) {
      return handleError(ERROR.MISSING_ID)
    }
    return this.handleRequest({
      path: `/now/deployments/${deploymentId}`,
      method: 'GET'
    });
  }
  createDeployment(data: Object) {
    if (!data) {
      return handleError(ERROR.MISSING_BODY)
    }

    return this.handleRequest({
      data,
      path: '/now/deployments',
      method: 'POST',
    });
  }
  deleteDeployment(deploymentId: string) : Promise<Object> {
    if (!deploymentId) {
      return handleError(ERROR.MISSING_ID)
    }
    return this.handleRequest({
      path: `/now/deployments/${deploymentId}`,
      method: 'DELETE'
    });
  }
  getFiles(deploymentId: string) {
    if (!deploymentId) {
      return handleError(ERROR.MISSING_ID)
    }

    return this.handleRequest({
      path: `/now/deployments/${deploymentId}/files`,
      method: 'GET'
    });
  }
  getFile(deploymentId: string, fileId: string) {
    if (!deploymentId) {
      return handleError(ERROR.MISSING_ID)
    }

    if (!fileId) {
      return handleError(ERROR.MISSING_FILE_ID)
    }

    return this.handleRequest({
      path: `/now/deployments/${deploymentId}/files/${fileId}`,
      method: 'GET'
    });
  }
  getDomains() {
    return this.handleRequest({
      path: '/domains',
      method: 'GET'
    }, 'domains');
  }
  addDomain(domain: Object) {
    if (typeof domain.name !== 'string') {
      return handleError(ERROR.MISSING_NAME);
    }
    return this.handleRequest({
      path: '/domains',
      method: 'post',
      data: {
        name: domain.name,
        isExternal: domain.isExternalDNS
      }
    });
  }
  deleteDomain(name: string) {
    if (typeof name !== 'string') {
      return handleError(ERROR.MISSING_NAME);
    }
    return this.handleRequest({
      path: `/domains/${name}`,
      method: 'DELETE'
    });
  }
  getDomainRecords(domain) {
    return this.handleRequest({
      path: `/domains/${domain}/records`,
      method: 'GET'
    }, 'records');
  }
  addDomainRecord(domain, recordData) {
    return this.handleRequest({
      path: `/domains/${domain}/records`,
      method: 'POST',
      data: recordData
    });
  }
  deleteDomainRecord(domain, recordId) {
    return this.handleRequest({
      path: `/domains/${domain}/records/${recordId}`,
      method: 'delete'
    })
  }
  getCertificates(cn: string) {
    let path = '/certs';
    if (cn) {
      path += `/now/${cn}`;
    }
    return this.handleRequest({
      path,
      method: 'GET'
    }, 'certs');
  }
  createCertificate(cn) {
    if (typeof cn !== 'string') {
      return handleError(ERROR.MISSING_CN, cn);
    }
    return this.handleRequest({
      path: '/now/certs',
      method: 'POST',
      data: {
        domains: [cn]
      }
    });
  }
  renewCertificate(cn: string) {
    if (typeof cn !== 'string') {
      return handleError(ERROR.MISSING_CN, cn);
    }
    return this.handleRequest({
      path: '/now/certs',
      method: 'POST',
      data: {
        domains: [cn],
        renew: true
      }
    });
  }
  replaceCertificate(cn: string, cert: string, key: string, ca: string) {
    return this.handleRequest({
      path: '/now/certs',
      method: 'PUT',
      data: {
        ca, cert, key,
        domains: [cn],
      }
    }, 'created');
  }
  deleteCertificate(cn: string) {
    if (typeof cn !== 'string') {
      return handleError(ERROR.MISSING_CN, cn);
    }

    return this.handleRequest({
      path: `/now/certs/${cn}`,
      method: 'DELETE'
    });
  }
  getAliases(id: ?string) {
    let path = '/now/aliases';
    if (id) {
      path = `/now/deployments/${id}/aliases`
    }
    return this.handleRequest({
      path,
      method: 'GET'
    }, 'aliases');
  }
  createAlias(id: string, alias: string) {
    if (!id) {
      return handleError(ERROR.MISSING_ID);
    }
    if (!alias) {
      return handleError(ERROR.MISSING_ALIAS);
    }
    return this.handleRequest({
      path: `/now/deployments/${id}/aliases`,
      method: 'POST',
      data: { alias }
    });
  }
  deleteAlias(id: string) {
    if (!id) {
      return handleError(ERROR.MISSING_ID);
    }
    return this.handleRequest({
      path: `/now/aliases/${id}`,
      method: 'DELETE'
    });
  }
  getSecrets() {
    return this.handleRequest({
      path: '/now/secrets',
      method: 'GET'
    }, 'secrets');
  }
  createSecret(name: string, value: string) {
    if (!name) {
      return handleError(ERROR.MISSING_NAME);
    }
    if (!value) {
      return handleError(ERROR.MISSING_VALUE);
    }
    return this.handleRequest({
      path: '/now/secrets',
      method: 'POST',
      data: { name, value }
    });
  }
  renameSecret(id: string, name: string) {
    if (!id) {
      return handleError(ERROR.MISSING_ID);
    }
    if (!name) {
      return handleError(ERROR.MISSING_NAME);
    }
    return this.handleRequest({
      path: `/now/secrets/${id}`,
      method: 'PATCH',
      data: { name }
    });
  }
  deleteSecret(id: string) {
    if (!id) {
      return handleError(ERROR.MISSING_ID);
    }
    return this.handleRequest({
      path: `/now/secrets/${id}`,
      method: 'DELETE'
    });
  };
}

export default function(token: string) {
  return new Now(token);
}
