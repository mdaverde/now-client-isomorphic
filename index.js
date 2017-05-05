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
  return new Promise((resolve, reject) => reject(error));
}

/**
 * Class wrapper around Zeit's 𝚫 {@link https://zeit.co/api now API}
 * @class Now
 */
export default class Now {
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
  handleRequest({ path, method, data }, selector: string) : Promise<Object | Object[]> {
    const headers = {
      Authorization: `Bearer ${this._token}`
    };
    const url = this._generateUrl(path);
    return axios({ method, url, data, headers })
      .then(({ data }) => data[selector]);
  }
  /**
   * Returns all current deployments under the account
   */
  getDeployments() : Promise<{ uid: string, name: string, url: string, created: string }[]> {
    return this.handleRequest({
      path: '/now/deployments',
      method: 'GET'
    }, 'deployments')
  }
  /**
   * Returns single deployment data
   */
  getDeployment(deploymentId: string) : Promise<{ uid: string, host: string, state: string, stateTs: string }> {
    if (!deploymentId) {
      return handleError(ERROR.MISSING_ID)
    }
    return this.handleRequest({
      path: `/now/deployments/${deploymentId}`,
      method: 'GET'
    });
  }
  /**
   * Creates deployment
   */
  createDeployment(data: { package: string }) : Promise<{ uid: string, host: string, state: string }> {
    if (!data) {
      return handleError(ERROR.MISSING_BODY)
    }

    return this.handleRequest({
      data,
      path: '/now/deployments',
      method: 'POST',
    });
  }
  /**
   * Deletes specific deployment
   */
  deleteDeployment(deploymentId: string) : Promise<Object> {
    if (!deploymentId) {
      return handleError(ERROR.MISSING_ID)
    }
    return this.handleRequest({
      path: `/now/deployments/${deploymentId}`,
      method: 'DELETE'
    });
  }
  /**
   * Gets list of files from deployment
   */
  getFiles(deploymentId: string) : Promise<Object[]> {
    if (!deploymentId) {
      return handleError(ERROR.MISSING_ID)
    }
    return this.handleRequest({
      path: `/now/deployments/${deploymentId}/files`,
      method: 'GET'
    });
  }
  /**
   * Gets file data for specific file id
   */
  getFile(deploymentId: string, fileId: string) : Promise<Object> {
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
  /**
   * Returns list of domains registered
   */
  getDomains() : Promise<Object[]> {
    return this.handleRequest({
      path: '/domains',
      method: 'GET'
    }, 'domains');
  }
  /**
   * Ability to add a domain
   */
  addDomain(domain: { name: string, isExternalDNS: boolean }) {
    if (typeof domain.name !== 'string') {
      return handleError(ERROR.MISSING_NAME);
    }
    return this.handleRequest({
      path: '/domains',
      method: 'POST',
      data: {
        name: domain.name,
        isExternal: domain.isExternalDNS
      }
    });
  }
  /**
   * Delete a previously registered domain name from now
   */
  deleteDomain(name: string) {
    if (typeof name !== 'string') {
      return handleError(ERROR.MISSING_NAME);
    }
    return this.handleRequest({
      path: `/domains/${name}`,
      method: 'DELETE'
    });
  }
  /**
   * Get a list of DNS records created for a domain name
   */
  getDomainRecords(domain: string) {
    return this.handleRequest({
      path: `/domains/${domain}/records`,
      method: 'GET'
    }, 'records');
  }
  /**
   * Create a DNS record for a domain
   */
  addDomainRecord(domain: string, recordData: { data: { name: string, type: string, value: string, mxPriority: string } }) : Promise<{ uid: string }> {
    return this.handleRequest({
      path: `/domains/${domain}/records`,
      method: 'POST',
      data: recordData
    });
  }
  /**
   * Delete a DNS record created for a domain name
   */
  deleteDomainRecord(domain: string, recordId: string) {
    return this.handleRequest({
      path: `/domains/${domain}/records/${recordId}`,
      method: 'delete'
    })
  }
  /**
   * Retrieves a list of certificates issued for the authenticating user
   */
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
  /**
   * Issue a new certification
   */
  createCertificate(cn: string) {
    if (typeof cn !== 'string') {
      return handleError(ERROR.MISSING_CN, cn);
    }
    return this.handleRequest({
      path: '/now/certs',
      method: 'POST',
      data: { domains: [cn] }
    });
  }
  /**
   * Renew a new certification
   */
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
  /**
   * Replace an existing or create a new certificate entry with a user-supplied certificate
   */
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
  /**
   * Delete an existing certificate entry
   */
  deleteCertificate(cn: string) {
    if (typeof cn !== 'string') {
      return handleError(ERROR.MISSING_CN, cn);
    }

    return this.handleRequest({
      path: `/now/certs/${cn}`,
      method: 'DELETE'
    });
  }
  /**
   * Retrieves all of the active now aliases for the authenticating user
   */
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
  /**
   * Creates a new alias for the deployment
   */
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
  /**
   * Delete an alias by id
   */
  deleteAlias(id: string) {
    if (!id) {
      return handleError(ERROR.MISSING_ID);
    }
    return this.handleRequest({
      path: `/now/aliases/${id}`,
      method: 'DELETE'
    });
  }
  /**
   * Retrieves all of the active now secrets
   */
  getSecrets() {
    return this.handleRequest({
      path: '/now/secrets',
      method: 'GET'
    }, 'secrets');
  }
  /**
   * Creates a new secret
   */
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
  /**
   * Edit the name of a user's secret
   */
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

  /**
   * Delete a user's secret.
   */
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
